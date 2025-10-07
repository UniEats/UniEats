package ar.uba.fi.ingsoft1.product_example.Products;

import ar.uba.fi.ingsoft1.product_example.config.security.JwtService;
import ar.uba.fi.ingsoft1.product_example.config.security.SecurityConfig;
import ar.uba.fi.ingsoft1.product_example.Products.ProductCreateDTO;
import ar.uba.fi.ingsoft1.product_example.Products.ProductDTO;
import ar.uba.fi.ingsoft1.product_example.Products.ProductUpdateDTO;
import ar.uba.fi.ingsoft1.product_example.Products.ProductRestController;
import ar.uba.fi.ingsoft1.product_example.Products.ProductService;
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

    @Autowired
    private ObjectMapper objectMapper;

    private ProductDTO productDTO;

    @BeforeEach
    void setUp() {
        productDTO = new ProductDTO(1L, "Pizza", "Delicious pizza", new BigDecimal("500.00"), List.of(), new byte[5 * 1024]);
    }

    @Test
    @WithMockUser
    void getAllProducts_returnsList() throws Exception {
        Mockito.when(productService.geAlltProducts()).thenReturn(List.of(productDTO));

        mockMvc.perform(get("/products"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[0].name", is("Pizza")));
    }

    @Test
    @WithMockUser
    void getProductsWithAllIngredientsInStock_returnsList() throws Exception {
        Mockito.when(productService.getProductsAvailable()).thenReturn(List.of(productDTO));

        mockMvc.perform(get("/products/all-ingredients-in-stock"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name", is("Pizza")));
    }

    @Test
    @WithMockUser
    void getProductById_found() throws Exception {
        Mockito.when(productService.getProductById(1L)).thenReturn(Optional.of(productDTO));

        mockMvc.perform(get("/products/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("Pizza")));
    }

    @Test
    @WithMockUser
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
            List.of(1L),
            List.of(2L)
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
                List.of(1L),
                List.of(2L)
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
                Optional.of("Updated Pizza"),
                Optional.of("Updated Description"),
                Optional.of(new BigDecimal("600.00"))
        );

        ProductDTO updated = new ProductDTO(
            1L, "Updated Pizza", "Updated Description", new BigDecimal("600.00"), List.of(), new byte[5 * 1024]
        );

        Mockito.when(productService.updateProduct(Mockito.eq(1L), any())).thenReturn(Optional.of(updated));

        mockMvc.perform(patch("/products/1")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(updateDTO))
            )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("Updated Pizza")));
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
