package ar.uba.fi.ingsoft1.product_example.user;

import ar.uba.fi.ingsoft1.product_example.common.EmailService;
import ar.uba.fi.ingsoft1.product_example.config.security.JwtService;
import ar.uba.fi.ingsoft1.product_example.config.security.SecurityConfig;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UserRestController.class)
@AutoConfigureMockMvc(addFilters = false)
class UserRestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private JavaMailSender javaMailSender;

    @MockBean
    private EmailService emailService;

    @MockBean
    private UserService userService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private SecurityConfig securityConfig;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private PasswordEncoder passwordEncoder; // ← Este es el nuevo fix

    @Autowired
    private ObjectMapper objectMapper;

    private UserCreateDTO userCreateDTO;
    private TokenDTO tokenDTO;

    @BeforeEach
    void setUp() {
        userCreateDTO = new UserCreateDTO("john.doe@example.com", "password123", "ADMIN", 1L);
        tokenDTO = new TokenDTO("mocked-jwt-token", "", "", 1L);
    }


    @Test
    void signUp_userCreated_returns201() throws Exception {
        Mockito.when(userService.createUser(any(UserCreateDTO.class))).thenReturn(Optional.of(tokenDTO));

        mockMvc.perform(post("/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(userCreateDTO)))
                .andExpect(status().isCreated())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.accessToken").value("mocked-jwt-token"));
    }

    @Test
    void signUp_userAlreadyExists_returns409() throws Exception {
        Mockito.when(userService.createUser(any(UserCreateDTO.class))).thenReturn(Optional.empty());

        mockMvc.perform(post("/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(userCreateDTO)))
                .andExpect(status().isConflict());
    }

    @Test
    void getUserCount_returnsCorrectCount() throws Exception {
        Mockito.when(userService.getUserCount()).thenReturn(42L);

        mockMvc.perform(get("/users/count"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total", is(42)));
    }

    @Test
    void signUp_invalidInput_returns400() throws Exception {
        UserCreateDTO invalidUser = new UserCreateDTO("", "", "", 2L);

        mockMvc.perform(post("/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidUser)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void register_validUser_returnsSuccessMessage() throws Exception {
        UserRegisterDTO userRegisterDTO = new UserRegisterDTO(
                "Jane",
                "Doe",
                "jane.doe@example.com",
                30,
                "F",
                "Calle Falsa 123",
                "securePassword"
                );

        Mockito.when(userRepository.findByUsername(userRegisterDTO.email()))
                .thenReturn(Optional.empty());

        Mockito.when(passwordEncoder.encode(Mockito.anyString()))
                .thenReturn("encodedPassword");

        MockMultipartFile userPart = new MockMultipartFile(
                "user",
                "user",
                MediaType.APPLICATION_JSON_VALUE,
                objectMapper.writeValueAsBytes(userRegisterDTO)
        );

        MockMultipartFile photoPart = new MockMultipartFile(
                "photo",
                "photo.jpg",
                MediaType.IMAGE_JPEG_VALUE,
                "fake-image-content".getBytes()
        );

        mockMvc.perform(multipart("/users/register")
                        .file(userPart)
                        .file(photoPart)
                        .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Code sent to: " + userRegisterDTO.email()));
    }

    @Test
    void register_emailAlreadyExists_returnsBadRequest() throws Exception {
        UserRegisterDTO userRegisterDTO = new UserRegisterDTO(
                "Jane",
                "Doe",
                "jane.doe@example.com",
                30,
                "F",
                "Calle Falsa 123",
                "securePassword"
        );

        Mockito.when(userRepository.findByUsername(userRegisterDTO.email()))
                .thenReturn(Optional.of(new User()));

        MockMultipartFile userPart = new MockMultipartFile(
                "user",
                "user",
                MediaType.APPLICATION_JSON_VALUE,
                objectMapper.writeValueAsBytes(userRegisterDTO)
        );

        MockMultipartFile photoPart = new MockMultipartFile(
                "photo",
                "photo.jpg",
                MediaType.IMAGE_JPEG_VALUE,
                "fake-image-content".getBytes()
        );

        mockMvc.perform(multipart("/users/register")
                        .file(userPart)
                        .file(photoPart)
                        .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("The email is already registered"));
    }

    @Test
    void verifyEmail_correctCode_returnsSuccessMessage() throws Exception {
        User user = new User();
        user.setEmail("jane.doe@example.com");
        user.setVerificationCode("123456");
        user.setVerified(false);

        VerifyRequest request = new VerifyRequest("jane.doe@example.com", "123456");

        Mockito.when(userRepository.findByUsername(request.email()))
                .thenReturn(Optional.of(user));

        mockMvc.perform(post("/users/verify")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Email verified succesfully"));
    }

    @Test
    void verifyEmail_wrongCode_returnsBadRequest() throws Exception {
        User user = new User();
        user.setEmail("jane.doe@example.com");
        user.setVerificationCode("123456");
        user.setVerified(false);

        VerifyRequest request = new VerifyRequest("jane.doe@example.com", "wrongcode");

        Mockito.when(userRepository.findByUsername(request.email()))
                .thenReturn(Optional.of(user));

        mockMvc.perform(post("/users/verify")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Wrong code"));
    }

    @Test
    void verifyEmail_userNotFound_returnsBadRequest() throws Exception {
        VerifyRequest request = new VerifyRequest("nonexistent@example.com", "123456");

        Mockito.when(userRepository.findByUsername(request.email()))
                .thenReturn(Optional.empty());

        mockMvc.perform(post("/users/verify")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("User not found"));
    }
}
