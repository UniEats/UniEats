package ar.uba.fi.ingsoft1.product_example.Products;

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
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ProductRestController.class)
@Import({SecurityConfig.class})
class ProductRestControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ProductService productService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private UserRepository userRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private ProductDTO productDTO;

    @BeforeEach
    void setUp() {
        productDTO = new ProductDTO(1L, "Pizza", "Delicious pizza", new BigDecimal("500.00"), Map.of(), List.of(), Map.of(), new byte[5 * 1024], true);
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void getAllProducts_returnsList() throws Exception {
        Mockito.when(productService.geAlltProducts()).thenReturn(List.of(productDTO));

        mockMvc.perform(get("/products"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[0].name", is("Pizza")));
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void getProductsWithAllIngredientsInStock_returnsList() throws Exception {
        Mockito.when(productService.getProductsAvailable()).thenReturn(List.of(productDTO));

        mockMvc.perform(get("/products/all-ingredients-in-stock"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name", is("Pizza")));
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void getProductById_found() throws Exception {
        Mockito.when(productService.getProductById(1L)).thenReturn(Optional.of(productDTO));

        mockMvc.perform(get("/products/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("Pizza")));
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void getProductById_notFound() throws Exception {
        Mockito.when(productService.getProductById(999L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/products/999"))
            	.andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void createProduct_success() throws Exception {
        ProductCreateDTO createDTO = new ProductCreateDTO(
            "Pizza",
            "Delicious pizza",
            new BigDecimal("500.00"),
            List.of(),
            List.of(1L, 2L),
            List.of(3L)
        );

        MockMultipartFile image = new MockMultipartFile(
            "image", "pizza.jpg", MediaType.IMAGE_JPEG_VALUE, "fakeimage".getBytes()
        );

        MockMultipartFile json = new MockMultipartFile(
            "product", "", "application/json", objectMapper.writeValueAsBytes(createDTO)
        );

        Mockito.when(productService.createProduct(any(), any())).thenReturn(Optional.of(productDTO));

        mockMvc.perform(multipart("/products")
                .file(json)
                .file(image)
                .contentType(MediaType.MULTIPART_FORM_DATA)
        )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("Pizza")));
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void createProduct_fail_returns500() throws Exception {
        ProductCreateDTO createDTO = new ProductCreateDTO(
                "Pizza",
                "Delicious pizza",
                new BigDecimal("500.00"),
                List.of(),
                List.of(1L, 2L),
                List.of(3L)
        );

        MockMultipartFile image = new MockMultipartFile(
            "image", "pizza.jpg", MediaType.IMAGE_JPEG_VALUE, "fakeimage".getBytes()
        );

        MockMultipartFile json = new MockMultipartFile(
            "product", "", "application/json", objectMapper.writeValueAsBytes(createDTO)
        );

        Mockito.when(productService.createProduct(any(), any())).thenReturn(Optional.empty());

        mockMvc.perform(multipart("/products")
                .file(json)
                .file(image)
                .contentType(MediaType.MULTIPART_FORM_DATA)
        ).andExpect(status().isInternalServerError());
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void updateProduct_success() throws Exception {
        ProductUpdateDTO updateDTO = new ProductUpdateDTO(
                "Pizza Updated",
                "Updated Description",
                new BigDecimal("550.00"),
                List.of(),
                List.of(1L, 2L),
                List.of(3L)
        );

        String updateDTOJson = objectMapper.writeValueAsString(updateDTO);

        MockMultipartFile image = new MockMultipartFile(
                "image", "pizza_updated.jpg", MediaType.IMAGE_JPEG_VALUE, "updatedimage".getBytes()
        );

        MockMultipartFile json = new MockMultipartFile(
                "product", "", "application/json", updateDTOJson.getBytes()
        );

        ProductDTO updatedDTO = new ProductDTO(
                1L, "Pizza Updated", "Updated Description", new BigDecimal("550.00"),
                Map.of(), List.of(), Map.of(), new byte[5 * 1024], true
        );

        Mockito.when(productService.updateProduct(Mockito.eq(1L), any(), any()))
                .thenReturn(Optional.of(updatedDTO));

        mockMvc.perform(multipart("/products/1")
                        .file(json)
                        .file(image)
                        .with(req -> {
                            req.setMethod("PATCH");
                            return req;
                        })
                        .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("Pizza Updated")))
                .andExpect(jsonPath("$.description", is("Updated Description")));
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void deleteProduct_success() throws Exception {
        Mockito.when(productService.deleteProduct(1L)).thenReturn(true);

        mockMvc.perform(delete("/products/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void deleteProduct_notFound() throws Exception {
		Mockito.when(productService.deleteProduct(999L)).thenReturn(false);

        mockMvc.perform(delete("/products/999"))
                .andExpect(status().isNotFound());
    }
}
