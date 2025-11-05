package ar.uba.fi.ingsoft1.product_example.user;

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
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(SessionRestController.class)
@AutoConfigureMockMvc(addFilters = false)
class SessionRestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserService userService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private SecurityConfig securityConfig;

    @Autowired
    private ObjectMapper objectMapper;

    private UserLoginDTO userLoginDTO;
    private RefreshDTO refreshDTO;
    private TokenDTO tokenDTO;

    @BeforeEach
    void setUp() {
        userLoginDTO = new UserLoginDTO("john.doe@example.com", "password123");
        refreshDTO = new RefreshDTO("valid-refresh-token");
        tokenDTO = new TokenDTO("mocked-jwt-token", "", "", 1L);
    }

    @Test
    void login_validCredentials_returns201() throws Exception {
        Mockito.when(userService.loginUser(any(UserLoginDTO.class))).thenReturn(Optional.of(tokenDTO));

        mockMvc.perform(post("/sessions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(userLoginDTO)))
                .andExpect(status().isCreated())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.accessToken").value("mocked-jwt-token"));
    }

    @Test
    void login_invalidCredentials_returns401() throws Exception {
        Mockito.when(userService.loginUser(any(UserLoginDTO.class))).thenReturn(Optional.empty());

        mockMvc.perform(post("/sessions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(userLoginDTO)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void login_invalidInput_returns400() throws Exception {
        UserLoginDTO invalidLogin = new UserLoginDTO("", "");

        mockMvc.perform(post("/sessions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidLogin)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void refresh_validToken_returns200() throws Exception {
        Mockito.when(userService.refresh(any(RefreshDTO.class))).thenReturn(Optional.of(tokenDTO));

        mockMvc.perform(put("/sessions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(refreshDTO)))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.accessToken").value("mocked-jwt-token"));
    }

    @Test
    void refresh_invalidToken_returns401() throws Exception {
        Mockito.when(userService.refresh(any(RefreshDTO.class))).thenReturn(Optional.empty());

        mockMvc.perform(put("/sessions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(refreshDTO)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void refresh_invalidInput_returns400() throws Exception {
        RefreshDTO invalidRefresh = new RefreshDTO("");

        mockMvc.perform(put("/sessions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRefresh)))
                .andExpect(status().isBadRequest());
    }
}
