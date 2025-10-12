package ar.uba.fi.ingsoft1.product_example.Products;

import ar.uba.fi.ingsoft1.product_example.Ingredients.Ingredient;
import ar.uba.fi.ingsoft1.product_example.Tags.Tag;
import ar.uba.fi.ingsoft1.product_example.Tags.TagRepository;
import ar.uba.fi.ingsoft1.product_example.Ingredients.IngredientRepository;
import ar.uba.fi.ingsoft1.product_example.ProductIngredient.ProductIngredient;
import ar.uba.fi.ingsoft1.product_example.ProductIngredient.ProductIngredientRepository;
import ar.uba.fi.ingsoft1.product_example.MenuSections.MenuSectionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.mock.web.MockMultipartFile;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private IngredientRepository ingredientRepository;

    @Mock
    private ProductIngredientRepository productIngredientRepository;

    @Mock
    private TagRepository tagRepository;

    @Mock
    private MenuSectionRepository menuSectionRepository;

    @InjectMocks
    private ProductService productService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testGetAllProducts() {
        Product product = new Product("Product 1", "Description", new BigDecimal("100.0"));
        product.setId(1L);

        when(productRepository.findAll()).thenReturn(List.of(product));

        List<ProductDTO> products = productService.geAlltProducts();

        assertNotNull(products);
        assertEquals(1, products.size());
    }

    @Test
    void testGetProductById_Found() {
        Product product = new Product("Product 1", "Description", new BigDecimal("100.0"));
        product.setId(1L);

        when(productRepository.findById(1L)).thenReturn(Optional.of(product));

        Optional<ProductDTO> result = productService.getProductById(1L);

        assertTrue(result.isPresent());
        assertEquals("Product 1", result.get().name());
    }

    @Test
    void testCreateProduct_Success() throws Exception {
        ProductCreateDTO dto = new ProductCreateDTO("Product 1", "Description", new BigDecimal("100.0"), List.of(1L), List.of(1L), List.of());
        MockMultipartFile image = new MockMultipartFile("image", "image.png", "image/png", new byte[1]);

        Tag tag = new Tag();
        tag.setId(1L);
        when(tagRepository.findById(1L)).thenReturn(Optional.of(tag));

        Ingredient ingredient = new Ingredient();
        ingredient.setId(1L);
        when(ingredientRepository.findById(1L)).thenReturn(Optional.of(ingredient));

        Product product = new Product("Product 1", "Description", new BigDecimal("100.0"));
        product.setId(1L);
        when(productRepository.save(any(Product.class))).thenReturn(product);

        Optional<ProductDTO> result = productService.createProduct(dto, image);

        assertTrue(result.isPresent());
        assertEquals("Product 1", result.get().name());
    }

    @Test
    void testCreateProduct_ImageTooLarge() throws Exception {
        ProductCreateDTO dto = new ProductCreateDTO(
            "Product 1", "Description", new BigDecimal("100.0"), List.of(1L), List.of(1L), List.of(1L)
        );

        MockMultipartFile image = new MockMultipartFile("image", "image.png", "image/png", new byte[3 * 1024 * 1024]);

        Tag tag = new Tag();
        tag.setId(1L);
        when(tagRepository.findById(1L)).thenReturn(Optional.of(tag));

        Ingredient ingredient = new Ingredient();
        ingredient.setId(1L);
        when(ingredientRepository.findById(1L)).thenReturn(Optional.of(ingredient));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            productService.createProduct(dto, image);
        });

        assertEquals("Image cannot be greater than 2 MB", exception.getMessage());
    }

    @Test
    void testUpdateProduct() {
        Product existingProduct = new Product("Product 1", "Description", new BigDecimal("100.0"));
        existingProduct.setId(1L);

        when(productRepository.findById(1L)).thenReturn(Optional.of(existingProduct));
        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ProductUpdateDTO updateDTO = new ProductUpdateDTO(
            "Updated Product",
            "Updated Description",
            new BigDecimal("150.0"),
            List.of(),
            List.of(), 
            List.of()
        );

        Optional<ProductDTO> result = productService.updateProduct(1L, updateDTO, any());

        assertTrue(result.isPresent());
        assertEquals("Updated Product", result.get().name());
        assertEquals("Updated Description", result.get().description());
    }

    @Test
    void testDeleteProduct_Success() {
        Product product = new Product("Product 1", "Description", new BigDecimal("100.0"));
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(productRepository.existsById(1L)).thenReturn(true);

        boolean result = productService.deleteProduct(1L);

        assertTrue(result);
        verify(productRepository, times(1)).delete(product);
    }

    @Test
    void testDeleteProduct_NotFound() {
        when(productRepository.existsById(1L)).thenReturn(false);

        boolean result = productService.deleteProduct(1L);

        assertFalse(result);
    }
}
