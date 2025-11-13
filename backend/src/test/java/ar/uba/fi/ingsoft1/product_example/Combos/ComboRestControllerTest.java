package ar.uba.fi.ingsoft1.product_example.Combos;

import ar.uba.fi.ingsoft1.product_example.config.security.JwtService;
import ar.uba.fi.ingsoft1.product_example.config.security.SecurityConfig;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import ar.uba.fi.ingsoft1.product_example.user.UserRepository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ComboRestController.class)
@Import({SecurityConfig.class})
class ComboRestControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ComboService comboService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private UserRepository userRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private ComboDTO comboDTO;

    @BeforeEach
    void setUp() {
        comboDTO = new ComboDTO(1L, "Combo Pizza", "Delicious combo with pizza", new BigDecimal("700.00"), Map.of(), List.of(), Map.of(), new byte[5 * 1024], true);
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void getAllCombos_returnsList() throws Exception {
        Mockito.when(comboService.getAlltCombos()).thenReturn(List.of(comboDTO));

        mockMvc.perform(get("/combos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name", is("Combo Pizza")));
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void getCombosWithAllProductsInStock_returnsList() throws Exception {
        Mockito.when(comboService.getCombosAvailable()).thenReturn(List.of(comboDTO));

        mockMvc.perform(get("/combos/all-products-in-stock"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name", is("Combo Pizza")));
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void getComboById_found() throws Exception {
        Mockito.when(comboService.getComboById(1L)).thenReturn(Optional.of(comboDTO));

        mockMvc.perform(get("/combos/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("Combo Pizza")));
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void getComboById_notFound() throws Exception {
        Mockito.when(comboService.getComboById(999L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/combos/999"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void createCombo_success() throws Exception {
        ComboCreateDTO createDTO = new ComboCreateDTO(
                "Combo Pizza",
                "Delicious combo with pizza",
                new BigDecimal("700.00"),
                List.of(),
                List.of(1L, 2L),
                List.of(3L)
        );

        String createDTOJson = objectMapper.writeValueAsString(createDTO);

        MockMultipartFile image = new MockMultipartFile(
                "image", "combo_pizza.jpg", MediaType.IMAGE_JPEG_VALUE, "fakeimage".getBytes()
        );

        MockMultipartFile json = new MockMultipartFile(
                "combo", "", "application/json", createDTOJson.getBytes()
        );

        Mockito.when(comboService.createCombo(any(), any())).thenReturn(Optional.of(comboDTO));

        mockMvc.perform(multipart("/combos")
                        .file(json)
                        .file(image)
                        .contentType(MediaType.MULTIPART_FORM_DATA)
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("Combo Pizza")));
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void createCombo_fail_returns500() throws Exception {
        ComboCreateDTO createDTO = new ComboCreateDTO(
                "Combo Pizza",
                "Delicious combo with pizza",
                new BigDecimal("700.00"),
                List.of(),
                List.of(1L, 2L),
                List.of(3L)
        );

        MockMultipartFile image = new MockMultipartFile(
                "image", "combo_pizza.jpg", MediaType.IMAGE_JPEG_VALUE, "fakeimage".getBytes()
        );

        MockMultipartFile json = new MockMultipartFile(
                "combo", "", "application/json", objectMapper.writeValueAsBytes(createDTO)
        );

        Mockito.when(comboService.createCombo(any(), any())).thenReturn(Optional.empty());

        mockMvc.perform(multipart("/combos")
                .file(json)
                .file(image)
                .contentType(MediaType.MULTIPART_FORM_DATA)
        ).andExpect(status().isInternalServerError());
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void updateCombo_success() throws Exception {
        ComboUpdateDTO updateDTO = new ComboUpdateDTO(
                "Combo Pizza Updated",
                "Updated Description",
                new BigDecimal("750.00"),
                List.of(),
                List.of(1L, 3L),
                List.of(2L)
        );

        String updateDTOJson = objectMapper.writeValueAsString(updateDTO);

        MockMultipartFile image = new MockMultipartFile(
                "image", "combo_pizza_updated.jpg", MediaType.IMAGE_JPEG_VALUE, "updatedimage".getBytes()
        );

        MockMultipartFile json = new MockMultipartFile(
                "combo", "", "application/json", updateDTOJson.getBytes()
        );

        ComboDTO updatedDTO = new ComboDTO(
                1L, "Combo Pizza Updated", "Updated Description", new BigDecimal("750.00"),
                Map.of(), List.of(), Map.of(), new byte[5 * 1024], true
        );

        Mockito.when(comboService.updateCombo(Mockito.eq(1L), any(), any()))
                .thenReturn(Optional.of(updatedDTO));

        mockMvc.perform(multipart("/combos/1")
                        .file(json)
                        .file(image)
                        .with(req -> {
                            req.setMethod("PATCH");
                            return req;
                        })
                        .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("Combo Pizza Updated")))
                .andExpect(jsonPath("$.description", is("Updated Description")));
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void deleteCombo_success() throws Exception {
        Mockito.when(comboService.deleteCombo(1L)).thenReturn(true);

        mockMvc.perform(delete("/combos/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void deleteCombo_notFound() throws Exception {
        Mockito.when(comboService.deleteCombo(999L)).thenReturn(false);

        mockMvc.perform(delete("/combos/999"))
                .andExpect(status().isNotFound());
    }
}
