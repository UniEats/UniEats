package ar.uba.fi.ingsoft1.product_example.MenuSections;

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
import static org.mockito.ArgumentMatchers.eq;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(MenuSectionRestController.class)
@Import(SecurityConfig.class)
class MenuSectionRestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private MenuSectionService menuSectionsService;

    @Autowired
    private ObjectMapper objectMapper;

    private MenuSectionDTO menuSectionDTO;

    @BeforeEach
    void setUp() {
        menuSectionDTO = new MenuSectionDTO(1L, "Entradas", "-", List.of(), List.of());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getAllMenuSections_returnsList() throws Exception {
        Mockito.when(menuSectionsService.getAllMenuSections()).thenReturn(List.of(menuSectionDTO));

        mockMvc.perform(get("/menu-sections"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].label", is("Entradas")));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getMenuSectionById_found() throws Exception {
        Mockito.when(menuSectionsService.getMenuSectionById(1L)).thenReturn(Optional.of(menuSectionDTO));

        mockMvc.perform(get("/menu-sections/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.label", is("Entradas")));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getMenuSectionById_notFound() throws Exception {
        Mockito.when(menuSectionsService.getMenuSectionById(999L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/menu-sections/999"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void createMenuSection_success() throws Exception {
        MenuSectionCreateDTO createDTO = new MenuSectionCreateDTO("Entradas", "-");

        Mockito.when(menuSectionsService.createMenuSection(any())).thenReturn(Optional.of(menuSectionDTO));

        mockMvc.perform(post("/menu-sections")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.label", is("Entradas")));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void createMenuSection_fail_returns500() throws Exception {
        MenuSectionCreateDTO createDTO = new MenuSectionCreateDTO("Entradas", "-");

        Mockito.when(menuSectionsService.createMenuSection(any())).thenReturn(Optional.empty());

        mockMvc.perform(post("/menu-sections")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createDTO)))
                .andExpect(status().isInternalServerError());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void addProductsToMenuSection_success() throws Exception {
        MenuSectionAddProductsDTO addProductsDTO = new MenuSectionAddProductsDTO(List.of(1L, 2L, 3L));

        Mockito.when(menuSectionsService.addProductsToMenuSection(eq(1L), any()))
                .thenReturn(Optional.of(menuSectionDTO));

        mockMvc.perform(post("/menu-sections/1/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(addProductsDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.label", is("Entradas")));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void addProductsToMenuSection_notFound() throws Exception {
        MenuSectionAddProductsDTO addProductsDTO = new MenuSectionAddProductsDTO(List.of(1L, 2L));

        Mockito.when(menuSectionsService.addProductsToMenuSection(eq(999L), any()))
                .thenReturn(Optional.empty());

        mockMvc.perform(post("/menu-sections/999/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(addProductsDTO)))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void updateMenuSection_success() throws Exception {
        MenuSectionCreateDTO updateDTO = new MenuSectionCreateDTO("Platos principales", "-");

        MenuSectionDTO updatedDTO = new MenuSectionDTO(1L, "Platos principales", "-", List.of(), List.of());

        Mockito.when(menuSectionsService.updateMenuSection(eq(1L), any()))
                .thenReturn(Optional.of(updatedDTO));

        mockMvc.perform(patch("/menu-sections/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.label", is("Platos principales")));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void updateMenuSection_notFound() throws Exception {
        MenuSectionCreateDTO updateDTO = new MenuSectionCreateDTO("Platos principales", "-");

        Mockito.when(menuSectionsService.updateMenuSection(eq(999L), any()))
                .thenReturn(Optional.empty());

        mockMvc.perform(patch("/menu-sections/999")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDTO)))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void deleteMenuSection_success() throws Exception {
        Mockito.when(menuSectionsService.deleteMenuSection(1L)).thenReturn(true);

        mockMvc.perform(delete("/menu-sections/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void deleteMenuSection_notFound() throws Exception {
        Mockito.when(menuSectionsService.deleteMenuSection(999L)).thenReturn(false);

        mockMvc.perform(delete("/menu-sections/999"))
                .andExpect(status().isNotFound());
    }
}
