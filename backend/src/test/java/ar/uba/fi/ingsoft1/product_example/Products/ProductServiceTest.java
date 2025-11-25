package ar.uba.fi.ingsoft1.product_example.Products;

import ar.uba.fi.ingsoft1.product_example.Ingredients.Ingredient;
import ar.uba.fi.ingsoft1.product_example.MenuSections.MenuSection;
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
import java.util.ArrayList;
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
        ProductCreateDTO dto = new ProductCreateDTO("Product 1", "Description", new BigDecimal("100.0"), List.of(new IngredientQuantity(1L, 2)), List.of(1L), List.of());
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
            "Product 1", "Description", new BigDecimal("100.0"), List.of(new IngredientQuantity(1L, 2)), List.of(1L), List.of(1L)
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

        ProductUpdateDTO updateDTO = new ProductUpdateDTO(
            "Updated Product",
            "Updated Description",
            new BigDecimal("150.0"),
            List.of(new IngredientQuantity(1L, 1)),
            List.of(1L),
            List.of(1L)
        );
        MockMultipartFile image = new MockMultipartFile("image", "updatedCombo.png", "image/png", new byte[1]);

        when(productRepository.findById(1L)).thenReturn(Optional.of(existingProduct));

        Ingredient ingredient = new Ingredient();
        ingredient.setId(1L);
        when(ingredientRepository.findById(1L)).thenReturn(Optional.of(ingredient));

        Tag tag = new Tag();
        tag.setId(1L);
        when(tagRepository.findById(1L)).thenReturn(Optional.of(tag));

        MenuSection section = new MenuSection();
        section.setId(1L);
        section.setLabel("Mock Section");
        when(menuSectionRepository.findById(1L)).thenReturn(Optional.of(section));

        Product updatedProduct = new Product("Updated Product", "Updated Description", new BigDecimal("350.0"));
        updatedProduct.setId(1L);
        when(productRepository.save(any(Product.class))).thenReturn(updatedProduct);

        Optional<ProductDTO> result = productService.updateProduct(1L, updateDTO, image);

        assertTrue(result.isPresent());
        assertEquals("Updated Product", result.get().name());
        assertEquals("Updated Description", result.get().description());
        assertEquals(new BigDecimal("350.0"), result.get().price());
    }

    @Test
    void testUpdateProduct_ImageTooLarge_Throws() {
        Product existingProduct = new Product("Product 1", "Description", new BigDecimal("100.0"));
        existingProduct.setId(1L);
        existingProduct.setTags(new ArrayList<>());
        existingProduct.setMenuSections(new ArrayList<>());
        existingProduct.setProductIngredients(new ArrayList<>());

        ProductUpdateDTO updateDTO = new ProductUpdateDTO(
                "Updated",
                "Updated",
                new BigDecimal("150.0"),
                List.of(new IngredientQuantity(1L, 1)),
                List.of(),
                List.of()
        );

        MockMultipartFile image = new MockMultipartFile("image", "oversized.png", "image/png", new byte[3 * 1024 * 1024]);

        Ingredient ingredient = new Ingredient();
        ingredient.setId(1L);

        when(productRepository.findById(1L)).thenReturn(Optional.of(existingProduct));
        when(ingredientRepository.findById(1L)).thenReturn(Optional.of(ingredient));

        assertThrows(IllegalArgumentException.class, () -> productService.updateProduct(1L, updateDTO, image));
    }

    @Test
    void testUpdateProduct_PartialUpdateRetainsName() {
        Product existingProduct = new Product("Original", "Description", new BigDecimal("100.0"));
        existingProduct.setId(1L);
        existingProduct.setTags(new ArrayList<>());
        existingProduct.setMenuSections(new ArrayList<>());
        existingProduct.setProductIngredients(new ArrayList<>());

        ProductUpdateDTO updateDTO = new ProductUpdateDTO(
                null,
                "New Description",
                new BigDecimal("120.00"),
                List.of(new IngredientQuantity(1L, 2)),
                List.of(5L),
                List.of()
        );

        Ingredient ingredient = new Ingredient();
        ingredient.setId(1L);
        Tag newTag = new Tag();
        newTag.setId(5L);
        newTag.setTag("Mock Tag");

        when(productRepository.findById(1L)).thenReturn(Optional.of(existingProduct));
        when(ingredientRepository.findById(1L)).thenReturn(Optional.of(ingredient));
        when(tagRepository.findById(5L)).thenReturn(Optional.of(newTag));
        when(productRepository.save(any(Product.class))).thenAnswer(inv -> inv.getArgument(0));

        Optional<ProductDTO> result = productService.updateProduct(1L, updateDTO, null);

        assertTrue(result.isPresent());
        assertEquals("Original", existingProduct.getName());
        assertEquals(new BigDecimal("120.00"), existingProduct.getPrice());
        assertEquals("New Description", existingProduct.getDescription());
        assertEquals(1, existingProduct.getTags().size());
        assertEquals(5L, existingProduct.getTags().get(0).getId());
    }

    @Test
    void testUpdateProduct_TagAndSectionUpdates() {
        Product existingProduct = new Product("Product", "Description", new BigDecimal("100.0"));
        existingProduct.setId(1L);
        existingProduct.setTags(new ArrayList<>());
        existingProduct.setMenuSections(new ArrayList<>());
        existingProduct.setProductIngredients(new ArrayList<>());

        ProductUpdateDTO updateDTO = new ProductUpdateDTO(
                "Updated",
                "Updated",
                new BigDecimal("180.00"),
                List.of(new IngredientQuantity(2L, 1)),
                List.of(7L),
                List.of(3L)
        );

        Ingredient ingredient = new Ingredient();
        ingredient.setId(2L);
        Tag tag = new Tag();
        tag.setId(7L);
        tag.setTag("Mock Tag");
        MenuSection section = new MenuSection();
        section.setId(3L);
        section.setLabel("Mock Section");
        section.setLabel("Mock Section");

        when(productRepository.findById(1L)).thenReturn(Optional.of(existingProduct));
        when(ingredientRepository.findById(2L)).thenReturn(Optional.of(ingredient));
        when(tagRepository.findById(7L)).thenReturn(Optional.of(tag));
        when(menuSectionRepository.findById(3L)).thenReturn(Optional.of(section));
        when(productRepository.save(any(Product.class))).thenAnswer(inv -> inv.getArgument(0));

        Optional<ProductDTO> result = productService.updateProduct(1L, updateDTO, null);

        assertTrue(result.isPresent());
        verify(tagRepository).findById(7L);
        verify(menuSectionRepository).findById(3L);
        assertEquals(1, existingProduct.getTags().size());
        assertEquals(1, existingProduct.getMenuSections().size());
        assertTrue(section.getProducts().contains(existingProduct));
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

    @Test
    void testGetProductsAvailable_ReturnsList() {
        // Arrange
        Product product = new Product();
        product.setId(1L);
        product.setName("Hamburguesa");
        product.setDescription("Con queso y panceta");
        product.setPrice(new BigDecimal("1500.00"));
        product.setProductIngredients(List.of()); // No se testean acá los ingredientes
        product.setTags(List.of());

        when(productRepository.findProductsWithAllIngredientsInStock())
                .thenReturn(List.of(product));

        // Act
        List<ProductDTO> result = productService.getProductsAvailable();

        // Assert
        assertEquals(1, result.size());
        assertEquals("Hamburguesa", result.get(0).name());
        assertEquals("Con queso y panceta", result.get(0).description());
        assertEquals(new BigDecimal("1500.00"), result.get(0).price());
    }

    @Test
    void testGetProductsAvailable_EmptyResult() {
        when(productRepository.findProductsWithAllIngredientsInStock())
                .thenReturn(List.of());

        List<ProductDTO> result = productService.getProductsAvailable();

        assertNotNull(result);
        assertTrue(result.isEmpty());
    }
}
