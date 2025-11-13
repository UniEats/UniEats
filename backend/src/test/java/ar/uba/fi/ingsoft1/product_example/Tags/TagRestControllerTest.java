package ar.uba.fi.ingsoft1.product_example.Tags;

import ar.uba.fi.ingsoft1.product_example.config.security.JwtService;
import ar.uba.fi.ingsoft1.product_example.config.security.SecurityConfig;
import ar.uba.fi.ingsoft1.product_example.user.UserRepository;
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

@WebMvcTest(TagRestController.class)
@Import(SecurityConfig.class)
class TagRestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TagService tagService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private UserRepository userRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private TagDTO tagDTO;

    @BeforeEach
    void setUp() {
        tagDTO = new TagDTO(1L, "Especial");
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void getTags_returnsList() throws Exception {
        Mockito.when(tagService.getTags()).thenReturn(List.of(tagDTO));

        mockMvc.perform(get("/tags"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].tag", is("Especial")));
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void getTagById_found() throws Exception {
        Mockito.when(tagService.getTagById(1L)).thenReturn(Optional.of(tagDTO));

        mockMvc.perform(get("/tags/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tag", is("Especial")));
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void getTagById_notFound() throws Exception {
        Mockito.when(tagService.getTagById(999L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/tags/999"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void createTag_success() throws Exception {
        TagCreateDTO createDTO = new TagCreateDTO("Promo");

        Mockito.when(tagService.createTag(any())).thenReturn(new TagDTO(2L, "Promo"));

        mockMvc.perform(post("/tags")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.tag", is("Promo")));
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void updateTag_success() throws Exception {
        TagCreateDTO updateDTO = new TagCreateDTO("Updated Tag");

        Mockito.when(tagService.updateTag(Mockito.eq(1L), any()))
                .thenReturn(Optional.of(new TagDTO(1L, "Updated Tag")));

        mockMvc.perform(patch("/tags/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tag", is("Updated Tag")));
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void updateTag_notFound() throws Exception {
        TagCreateDTO updateDTO = new TagCreateDTO("Doesn't Matter");

        Mockito.when(tagService.updateTag(Mockito.eq(999L), any()))
                .thenReturn(Optional.empty());

        mockMvc.perform(patch("/tags/999")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateDTO)))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void deleteTag_success() throws Exception {
        Mockito.when(tagService.deleteTag(1L)).thenReturn(true);

        mockMvc.perform(delete("/tags/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void deleteTag_notFound() throws Exception {
        Mockito.when(tagService.deleteTag(999L)).thenReturn(false);

        mockMvc.perform(delete("/tags/999"))
                .andExpect(status().isNotFound());
    }
}
