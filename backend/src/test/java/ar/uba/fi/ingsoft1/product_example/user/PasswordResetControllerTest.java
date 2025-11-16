package ar.uba.fi.ingsoft1.product_example.user;

import ar.uba.fi.ingsoft1.product_example.common.EmailService;
import ar.uba.fi.ingsoft1.product_example.config.security.JwtService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PasswordResetController.class)
@AutoConfigureMockMvc(addFilters = false)
class PasswordResetControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private PasswordEncoder passwordEncoder;

    @MockBean
    private EmailService emailService;

    @MockBean
    private UserService userService;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private JwtService jwtService;

    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);
        user.setEmail("john@example.com");
        user.setUsername("john@example.com");
    }

    @Test
    void requestPasswordReset_validEmail_returns200_andSendsEmail() throws Exception {
        when(userRepository.findByUsername("john@example.com"))
                .thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenReturn(user);

        PasswordResetRequestDTO dto = new PasswordResetRequestDTO("john@example.com");

        mockMvc.perform(post("/users/password-reset/request")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message", is("You will receive a recovery code")));

        verify(userRepository).save(argThat(saved ->
                saved.getVerificationCode() != null &&
                saved.getVerificationCode().length() == 6
        ));

        verify(emailService).sendPasswordResetEmail(eq("john@example.com"), anyString());
    }

    @Test
    void requestPasswordReset_invalidEmail_returns200_invalidMessage() throws Exception {
        when(userRepository.findByUsername("nope@example.com"))
                .thenReturn(Optional.empty());

        PasswordResetRequestDTO dto = new PasswordResetRequestDTO("nope@example.com");

        mockMvc.perform(post("/users/password-reset/request")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message", is("Invalid email")));

        verify(emailService, never()).sendPasswordResetEmail(any(), any());
        verify(userRepository, never()).save(any());
    }

    @Test
    void resetPassword_userNotFound_returns400() throws Exception {
        when(userRepository.findByUsername("john@example.com"))
                .thenReturn(Optional.empty());

        PasswordResetDTO dto = new PasswordResetDTO("john@example.com", "123456", "newPass!");

        mockMvc.perform(post("/users/password-reset/reset")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", is("User not found")));
    }

    @Test
    void resetPassword_invalidCode_returns400() throws Exception {
        user.setVerificationCode("999999");

        when(userRepository.findByUsername("john@example.com"))
                .thenReturn(Optional.of(user));

        PasswordResetDTO dto = new PasswordResetDTO("john@example.com", "123456", "newPass!");

        mockMvc.perform(post("/users/password-reset/reset")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", is("Invalid code")));

        verify(passwordEncoder, never()).encode(anyString());
        verify(userRepository, never()).save(any());
    }

    @Test
    void resetPassword_validCode_updatesPassword_andClearsFields() throws Exception {
        user.setVerificationCode("123456");

        when(userRepository.findByUsername("john@example.com"))
                .thenReturn(Optional.of(user));
        when(passwordEncoder.encode("newPass!")).thenReturn("encodedPass");
        when(userRepository.save(any())).thenReturn(user);

        PasswordResetDTO dto = new PasswordResetDTO("john@example.com", "123456", "newPass!");

        mockMvc.perform(post("/users/password-reset/reset")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message", is("Password updated successfully")));

        verify(passwordEncoder).encode("newPass!");
        verify(userRepository).save(argThat(saved ->
                saved.getPassword().equals("encodedPass") &&
                saved.getVerificationCode() == null &&
                !saved.isLocked() &&
                saved.getFailedLoginAttempts() == 0
        ));
    }
}
