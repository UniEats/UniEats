package ar.uba.fi.ingsoft1.product_example.Combos;

import ar.uba.fi.ingsoft1.product_example.MenuSections.MenuSection;
import ar.uba.fi.ingsoft1.product_example.Products.Product;
import ar.uba.fi.ingsoft1.product_example.Products.ProductRepository;
import ar.uba.fi.ingsoft1.product_example.Tags.Tag;
import ar.uba.fi.ingsoft1.product_example.Tags.TagRepository;
import ar.uba.fi.ingsoft1.product_example.Ingredients.IngredientRepository;
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

class ComboServiceTest {
    @Mock
    private ComboRepository comboRepository;

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
    private ComboService comboService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testCreateCombo_Success() throws Exception {
        ComboCreateDTO dto = new ComboCreateDTO(
                "Combo 1", "Delicioso combo", new BigDecimal("300.0"),
                List.of(new ProductQuantity(1L, 2)), List.of(1L), List.of(1L)
        );
        MockMultipartFile image = new MockMultipartFile("image", "combo.png", "image/png", new byte[1]);

        Product product = new Product("Product 1", "Description", new BigDecimal("100.0"));
        product.setId(1L);
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));

        Tag tag = new Tag();
        tag.setId(1L);
        when(tagRepository.findById(1L)).thenReturn(Optional.of(tag));

        MenuSection section = new MenuSection();
        section.setId(1L);
        section.setLabel("Mock Section");
        when(menuSectionRepository.findById(1L)).thenReturn(Optional.of(section));

        Combo combo = new Combo("Combo 1", "Delicioso combo", new BigDecimal("300.0"));
        combo.setId(1L);
        when(comboRepository.save(any(Combo.class))).thenReturn(combo);

        Optional<ComboDTO> result = comboService.createCombo(dto, image);

        assertTrue(result.isPresent());
        assertEquals("Combo 1", result.get().name());
        assertEquals("Delicioso combo", result.get().description());
        assertEquals(new BigDecimal("300.0"), result.get().price());
    }

    @Test
    void testCreateCombo_ImageTooLarge() throws Exception {
        ComboCreateDTO dto = new ComboCreateDTO(
                "Combo 1", "Delicioso combo", new BigDecimal("300.0"),
                List.of(new ProductQuantity(1L, 2)), List.of(1L), List.of(1L)
        );
        MockMultipartFile image = new MockMultipartFile("image", "combo.png", "image/png", new byte[3 * 1024 * 1024]); // 3 MB

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            comboService.createCombo(dto, image);
        });

        assertEquals("Image cannot be greater than 2 MB", exception.getMessage());
    }

    @Test
    void testGetComboById_Found() {
        Combo combo = new Combo("Combo 1", "Delicioso combo", new BigDecimal("300.0"));
        combo.setId(1L);

        when(comboRepository.findById(1L)).thenReturn(Optional.of(combo));

        Optional<ComboDTO> result = comboService.getComboById(1L);

        assertTrue(result.isPresent());
        assertEquals("Combo 1", result.get().name());
    }

    @Test
    void testGetComboById_NotFound() {
        when(comboRepository.findById(1L)).thenReturn(Optional.empty());

        Optional<ComboDTO> result = comboService.getComboById(1L);

        assertFalse(result.isPresent());
    }

    @Test
    void testUpdateCombo_Success() throws Exception {
        Combo existingCombo = new Combo("Old Combo", "Old description", new BigDecimal("250.0"));
        existingCombo.setId(1L);

        ComboUpdateDTO updateDTO = new ComboUpdateDTO(
                "Updated Combo", "Updated description", new BigDecimal("350.0"), List.of(new ProductQuantity(1L, 1)), List.of(1L), List.of(1L)
        );
        MockMultipartFile image = new MockMultipartFile("image", "updatedCombo.png", "image/png", new byte[1]);

        when(comboRepository.findById(1L)).thenReturn(Optional.of(existingCombo));

        Product product = new Product("Product 1", "Description", new BigDecimal("100.0"));
        product.setId(1L);
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));

        Tag tag = new Tag();
        tag.setId(1L);
        when(tagRepository.findById(1L)).thenReturn(Optional.of(tag));

        MenuSection section = new MenuSection();
        section.setId(1L);
        section.setLabel("Mock Section");
        when(menuSectionRepository.findById(1L)).thenReturn(Optional.of(section));

        Combo updatedCombo = new Combo("Updated Combo", "Updated description", new BigDecimal("350.0"));
        updatedCombo.setId(1L);
        when(comboRepository.save(any(Combo.class))).thenReturn(updatedCombo);

        Optional<ComboDTO> result = comboService.updateCombo(1L, updateDTO, image);

        assertTrue(result.isPresent());
        assertEquals("Updated Combo", result.get().name());
        assertEquals("Updated description", result.get().description());
        assertEquals(new BigDecimal("350.0"), result.get().price());
    }

    @Test
    void testUpdateCombo_ImageTooLarge_Throws() throws Exception {
        Combo existingCombo = new Combo("Combo", "Desc", new BigDecimal("200.0"));
        existingCombo.setId(1L);
        existingCombo.setTags(new ArrayList<>());
        existingCombo.setMenuSections(new ArrayList<>());
        existingCombo.setComboProducts(new ArrayList<>());

        ComboUpdateDTO updateDTO = new ComboUpdateDTO(
                "Updated",
                "Updated",
                new BigDecimal("300.0"),
                List.of(new ProductQuantity(1L, 1)),
                List.of(),
                List.of()
        );

        MockMultipartFile image = new MockMultipartFile("image", "combo.png", "image/png", new byte[3 * 1024 * 1024]);

        Product product = new Product("Product", "Desc", new BigDecimal("100.0"));
        product.setId(1L);

        when(comboRepository.findById(1L)).thenReturn(Optional.of(existingCombo));
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));

        assertThrows(IllegalArgumentException.class, () -> comboService.updateCombo(1L, updateDTO, image));
    }

    @Test
    void testUpdateCombo_PartialUpdateRetainsName() throws Exception {
        Combo existingCombo = new Combo("Original Combo", "Desc", new BigDecimal("200.0"));
        existingCombo.setId(1L);
        existingCombo.setTags(new ArrayList<>());
        existingCombo.setMenuSections(new ArrayList<>());
        existingCombo.setComboProducts(new ArrayList<>());

        ComboUpdateDTO updateDTO = new ComboUpdateDTO(
                null,
                "New description",
                new BigDecimal("250.0"),
                List.of(new ProductQuantity(1L, 1)),
                List.of(5L),
                List.of()
        );

        Product product = new Product("Product", "Desc", new BigDecimal("100.0"));
        product.setId(1L);
        Tag tag = new Tag();
        tag.setId(5L);
        tag.setTag("Mock Tag");

        when(comboRepository.findById(1L)).thenReturn(Optional.of(existingCombo));
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(tagRepository.findById(5L)).thenReturn(Optional.of(tag));
        when(comboRepository.save(any(Combo.class))).thenAnswer(inv -> inv.getArgument(0));

        Optional<ComboDTO> result = comboService.updateCombo(1L, updateDTO, null);

        assertTrue(result.isPresent());
        assertEquals("Original Combo", existingCombo.getName());
        assertEquals("New description", existingCombo.getDescription());
        assertEquals(0, existingCombo.getPrice().compareTo(new BigDecimal("250.0")));
        assertEquals(1, existingCombo.getTags().size());
    }

    @Test
    void testUpdateCombo_TagAndSectionUpdates() throws Exception {
        Combo existingCombo = new Combo("Combo", "Desc", new BigDecimal("200.0"));
        existingCombo.setId(1L);
        existingCombo.setTags(new ArrayList<>());
        existingCombo.setMenuSections(new ArrayList<>());
        existingCombo.setComboProducts(new ArrayList<>());

        ComboUpdateDTO updateDTO = new ComboUpdateDTO(
                "Updated",
                "Updated",
                new BigDecimal("260.0"),
                List.of(new ProductQuantity(2L, 2)),
                List.of(7L),
                List.of(3L)
        );

        Product product = new Product("Product", "Desc", new BigDecimal("100.0"));
        product.setId(2L);
        Tag tag = new Tag();
        tag.setId(7L);
        tag.setTag("Mock Tag");
        MenuSection section = new MenuSection();
        section.setId(3L);
        section.setLabel("Mock Section");

        when(comboRepository.findById(1L)).thenReturn(Optional.of(existingCombo));
        when(productRepository.findById(2L)).thenReturn(Optional.of(product));
        when(tagRepository.findById(7L)).thenReturn(Optional.of(tag));
        when(menuSectionRepository.findById(3L)).thenReturn(Optional.of(section));
        when(comboRepository.save(any(Combo.class))).thenAnswer(inv -> inv.getArgument(0));

        Optional<ComboDTO> result = comboService.updateCombo(1L, updateDTO, null);

        assertTrue(result.isPresent());
        verify(tagRepository).findById(7L);
        verify(menuSectionRepository).findById(3L);
        assertEquals(1, existingCombo.getTags().size());
        assertEquals(1, existingCombo.getMenuSections().size());
        assertTrue(section.getCombos().contains(existingCombo));
    }

    @Test
    void testDeleteCombo_Success() {
        Combo combo = new Combo("Combo 1", "Delicioso combo", new BigDecimal("300.0"));
        combo.setId(1L);

        when(comboRepository.findById(1L)).thenReturn(Optional.of(combo));
        when(comboRepository.existsById(1L)).thenReturn(true);

        boolean result = comboService.deleteCombo(1L);

        assertTrue(result);
        verify(comboRepository, times(1)).delete(combo);
    }

    @Test
    void testDeleteCombo_NotFound() {
        when(comboRepository.existsById(1L)).thenReturn(false);

        boolean result = comboService.deleteCombo(1L);

        assertFalse(result);
    }

    @Test
    void testGetCombosAvailable_ReturnsList() {
        Combo combo = new Combo("Combo 1", "Delicioso combo", new BigDecimal("300.0"));
        combo.setId(1L);

        when(comboRepository.findCombosWithAllProductsInStock()).thenReturn(List.of(combo));

        List<ComboDTO> result = comboService.getCombosAvailable();

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Combo 1", result.get(0).name());
        assertEquals("Delicioso combo", result.get(0).description());
        assertEquals(new BigDecimal("300.0"), result.get(0).price());
    }

    @Test
    void testGetAlltCombos_ReturnsList() {
        Combo combo1 = new Combo("Combo 1", "Descripción 1", new BigDecimal("100.0"));
        combo1.setId(1L);

        Combo combo2 = new Combo("Combo 2", "Descripción 2", new BigDecimal("200.0"));
        combo2.setId(2L);

        when(comboRepository.findAll()).thenReturn(List.of(combo1, combo2));

        List<ComboDTO> result = comboService.getAlltCombos();

        assertNotNull(result);
        assertEquals(2, result.size());

        assertEquals("Combo 1", result.get(0).name());
        assertEquals("Descripción 1", result.get(0).description());
        assertEquals(new BigDecimal("100.0"), result.get(0).price());

        assertEquals("Combo 2", result.get(1).name());
        assertEquals("Descripción 2", result.get(1).description());
        assertEquals(new BigDecimal("200.0"), result.get(1).price());
    }

    @Test
    void testGetAlltCombos_EmptyList() {
        when(comboRepository.findAll()).thenReturn(List.of());

        List<ComboDTO> result = comboService.getAlltCombos();

        assertNotNull(result);
        assertTrue(result.isEmpty());
    }
}
