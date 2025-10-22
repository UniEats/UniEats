package ar.uba.fi.ingsoft1.product_example.user;

import ar.uba.fi.ingsoft1.product_example.config.security.JwtService;
import ar.uba.fi.ingsoft1.product_example.user.refresh_token.RefreshTokenService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import ar.uba.fi.ingsoft1.product_example.common.EmailService;
import ar.uba.fi.ingsoft1.product_example.config.security.JwtService;
import ar.uba.fi.ingsoft1.product_example.user.refresh_token.RefreshTokenService;

class UserServiceTest {

    private UserService userService;

    private static final String USERNAME = "user";
    private static final String PASSWORD = "password";

    @BeforeEach
    void setup() {
        var passwordEncoder = new BCryptPasswordEncoder();
        var passwordHash = passwordEncoder.encode(PASSWORD);

        var user = new User(USERNAME, passwordHash, "ROLE_USER");
        user.setVerified(true);

        UserRepository userRepository = mock();
        when(userRepository.findByUsername(anyString()))
                .thenReturn(Optional.empty());
        when(userRepository.findByUsername(USERNAME))
                .thenReturn(Optional.of(user));

        var key = "0".repeat(64);
        userService = new UserService(
                new JwtService(key, 1L),
                new BCryptPasswordEncoder(),
                userRepository,
                new RefreshTokenService(1L, 20, mock()),
                mock(EmailService.class)
        );
    }

    @Test
    void loginUser() {
        var response = userService.loginUser(new UserLoginDTO(USERNAME, PASSWORD));
        assertNotNull(response.orElseThrow());
    }

    @Test
    void loginWithWrongPassword() {
        var response = userService.loginUser(new UserLoginDTO(USERNAME, PASSWORD + "_wrong"));
        assertEquals(Optional.empty(), response);
    }

    @Test
    void loginNonexistentUser() {
        var response = userService.loginUser(new UserLoginDTO(USERNAME + "_wrong", PASSWORD));
        assertEquals(Optional.empty(), response);
    }

    @Test
    void createNewUser() {
        UserCreateDTO user = new UserCreateDTO(USERNAME + "_new", PASSWORD, "ROLE_USER");
        var response = userService.createUser(user);
        assertTrue(response.isPresent());
    }

    @Test
    void loadUserThatExists() {
        var userDetails = userService.loadUserByUsername(USERNAME);
        assertEquals(USERNAME, userDetails.getUsername());
    }

    @Test
    void loadUserThatDoesNotExist() {
        assertThrows(
                org.springframework.security.core.userdetails.UsernameNotFoundException.class,
                () -> userService.loadUserByUsername(USERNAME + "_wrong")
        );
    }

    @Test
    void refreshWithInvalidToken() {
        var response = userService.refresh(new RefreshDTO("invalid_token"));
        assertEquals(Optional.empty(), response);
    }
}
