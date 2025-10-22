package ar.uba.fi.ingsoft1.product_example.Menus;

import ar.uba.fi.ingsoft1.product_example.MenuSections.MenuSectionDTO;
import ar.uba.fi.ingsoft1.product_example.MenuSections.MenuSectionService;
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
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(MenuRestController.class)
@Import({SecurityConfig.class})
class MenuRestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private MenuSectionService menuSectionService;

    @Autowired
    private ObjectMapper objectMapper;

    private MenuSectionDTO section1;
    private MenuSectionDTO section2;

    @BeforeEach
    void setUp() {
        section1 = new MenuSectionDTO(1L, "Starters", "Appetizers to begin the meal", List.of(), List.of());
        section2 = new MenuSectionDTO(2L, "Main Courses", "Hearty main dishes", List.of(), List.of());
    }

    @Test
    void getAllMenuSections_returnsList() throws Exception {
        Mockito.when(menuSectionService.getAllMenuSections())
                .thenReturn(List.of(section1, section2));

        mockMvc.perform(get("/menus")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].label", is("Starters")))
                .andExpect(jsonPath("$[1].label", is("Main Courses")));
    }

    @Test
    void getAllMenuSections_returnsEmptyList() throws Exception {
        Mockito.when(menuSectionService.getAllMenuSections())
                .thenReturn(List.of());

        mockMvc.perform(get("/menus")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }
}
