package ar.uba.fi.ingsoft1.product_example.user;

import ar.uba.fi.ingsoft1.product_example.common.EmailService;
import ar.uba.fi.ingsoft1.product_example.config.security.JwtService;
import ar.uba.fi.ingsoft1.product_example.config.security.JwtUserDetails;
import ar.uba.fi.ingsoft1.product_example.user.refresh_token.RefreshToken;
import ar.uba.fi.ingsoft1.product_example.user.refresh_token.RefreshTokenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.Random;

@Service
@Transactional
class UserService implements UserDetailsService {

    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final RefreshTokenService refreshTokenService;
    private final EmailService emailService;

    @Autowired
    UserService(
            JwtService jwtService,
            PasswordEncoder passwordEncoder,
            UserRepository userRepository,
            RefreshTokenService refreshTokenService,
            EmailService emailService
    ) {
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
        this.refreshTokenService = refreshTokenService;
        this.emailService = emailService;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository
                .findByUsername(username)
                .orElseThrow(() -> {
                    var msg = String.format("Username '%s' not found", username);
                    return new UsernameNotFoundException(msg);
                });
    }

    Optional<TokenDTO> createUser(UserCreateDTO data) {
        if (userRepository.findByUsername(data.username()).isPresent()) {
            return loginUser(data);
        } else {
            var user = data.asUser(passwordEncoder::encode);
            userRepository.save(user);
            return Optional.of(generateTokens(user));
        }
    }

    Optional<TokenDTO> loginUser(UserCredentials data) {
        Optional<User> maybeUser = userRepository.findByUsername(data.username());
        if (maybeUser.isEmpty()) {
            return Optional.empty();
        }

        User user = maybeUser.get();
        if (!user.isAccountNonLocked()) {
            return Optional.empty();
        }

        if (passwordEncoder.matches(data.password(), user.getPassword())) {
            // Correct password
            if (!user.isEnabled()) {
                return Optional.empty();
            }
            user.setFailedLoginAttempts(0);
            userRepository.save(user);
            return Optional.of(generateTokens(user));
        } else {
            // Wrong password
            handleFailedLoginAttempt(user);
            return Optional.empty();
        }
    }

    Optional<TokenDTO> refresh(RefreshDTO data) {
        return refreshTokenService.findByValue(data.refreshToken())
                .map(RefreshToken::user)
                .map(this::generateTokens);
    }

    long getUserCount() {
        return userRepository.count();
    }

    private TokenDTO generateTokens(User user) {
        String accessToken = jwtService.createToken(new JwtUserDetails(
                user.getUsername(),
                user.getRole()
        ));
        RefreshToken refreshToken = refreshTokenService.createFor(user);
        return new TokenDTO(accessToken, refreshToken.value(), user.getRole());
    }

    private void handleFailedLoginAttempt(User user) {
        user.setFailedLoginAttempts(user.getFailedLoginAttempts() + 1);
        final int MAX_ATTEMPTS = 5;

        if (user.getFailedLoginAttempts() >= MAX_ATTEMPTS) {
            user.setLocked(true);
            String resetCode = generateResetCode();
            user.setVerificationCode(resetCode);

            try {
                emailService.sendPasswordResetEmail(user.getUsername(), resetCode);
            } catch (Exception e) {
                System.err.println("Failed to send password reset email to " + user.getUsername() + ": " + e.getMessage());
            }
        }
        userRepository.save(user);
    }

    private String generateResetCode() {
        Random random = new Random();
        int code = 100000 + random.nextInt(900000);
        return String.valueOf(code);
    }
}
