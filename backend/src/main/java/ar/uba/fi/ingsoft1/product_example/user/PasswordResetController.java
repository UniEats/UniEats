package ar.uba.fi.ingsoft1.product_example.user;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import ar.uba.fi.ingsoft1.product_example.common.EmailService;
import java.util.Random;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/users/password-reset")
@Tag(name = "1 - Users")
public class PasswordResetController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Autowired
    PasswordResetController(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    @PostMapping("/request")
    @Operation(summary = "Request password reset code")
    public ResponseEntity<?> requestPasswordReset(@RequestBody PasswordResetRequestDTO request) {
        Optional<User> optionalUser = userRepository.findByUsername(request.email());
        if (optionalUser.isEmpty()) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Invalid email");
            return ResponseEntity.ok(response);
        }

        User user = optionalUser.get();
        String resetCode = generateResetCode();
        user.setVerificationCode(resetCode);
        userRepository.save(user);

        emailService.sendPasswordResetEmail(request.email(), resetCode);

        Map<String, String> response = new HashMap<>();
        response.put("message", "You will receive a recovery code");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reset")
    @Operation(summary = "Reset password using verification code")
    @ApiResponse(responseCode = "400", description = "Invalid code or user not found")
    public ResponseEntity<?> resetPassword(@RequestBody PasswordResetDTO request) {
        Optional<User> optionalUser = userRepository.findByUsername(request.email());
        if (optionalUser.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "User not found"));
        }

        User user = optionalUser.get();
        if (user.getVerificationCode() == null || !user.getVerificationCode().equals(request.code())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid code"));
        }

        user.setPassword(passwordEncoder.encode(request.newPassword()));
        user.setVerificationCode(null);

        // logic for the account-blocking functionality
        user.setLocked(false);
        user.setFailedLoginAttempts(0);

        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
    }

    private String generateResetCode() {
        Random random = new Random();
        int code = 100000 + random.nextInt(900000); 
        return String.valueOf(code);
    }
}