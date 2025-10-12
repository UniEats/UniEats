package ar.uba.fi.ingsoft1.product_example.Ingredients;

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
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;

import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(IngredientRestController.class)
@Import({SecurityConfig.class})
class IngredientRestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private IngredientService ingredientService;

    @MockBean
    private JwtService jwtService;

    @Autowired
    private ObjectMapper objectMapper;

    private IngredientDTO ingredientDTO;

    @BeforeEach
    void setUp() {
        ingredientDTO = new IngredientDTO(1L, "Tomato", "Fresh tomato", 10);
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getIngredients_returnsList() throws Exception {
        Mockito.when(ingredientService.getIngredients()).thenReturn(List.of(ingredientDTO));

        mockMvc.perform(get("/ingredients"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name", is("Tomato")));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getIngredientById_found() throws Exception {
        Mockito.when(ingredientService.getIngredientById(1L)).thenReturn(Optional.of(ingredientDTO));

        mockMvc.perform(get("/ingredients/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("Tomato")))
                .andExpect(jsonPath("$.stock", is(10)));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getIngredientById_notFound() throws Exception {
        Mockito.when(ingredientService.getIngredientById(999L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/ingredients/999"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void createIngredient_success() throws Exception {
        IngredientCreateDTO createDTO = new IngredientCreateDTO("Tomato", "Fresh tomato", 10);
        Mockito.when(ingredientService.createIngredient(any())).thenReturn(ingredientDTO);

        mockMvc.perform(post("/ingredients")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createDTO))
        )
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name", is("Tomato")));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void increaseStock_success() throws Exception {
        Mockito.when(ingredientService.increaseStock(1L, 5)).thenReturn(Optional.of(
                new IngredientDTO(1L, "Tomato", "Fresh tomato", 15)
        ));

        mockMvc.perform(patch("/ingredients/1/stock")
                .param("amount", "5")
        )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.stock", is(15)));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void increaseStock_notFound_returns404() throws Exception {
        Mockito.when(ingredientService.increaseStock(999L, 5)).thenReturn(Optional.empty());

        mockMvc.perform(patch("/ingredients/999/stock")
                .param("amount", "5")
        )
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void increaseStock_invalidAmount_returns400() throws Exception {
        Mockito.when(ingredientService.increaseStock(1L, -100))
                .thenThrow(new IllegalArgumentException("Stock cannot be negative."));

        mockMvc.perform(patch("/ingredients/1/stock")
                .param("amount", "-100")
        )
                .andExpect(status().isBadRequest());
    }
}
