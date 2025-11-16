package ar.uba.fi.ingsoft1.product_example.MenuSections;

import ar.uba.fi.ingsoft1.product_example.Combos.Combo;
import ar.uba.fi.ingsoft1.product_example.Combos.ComboRepository;
import ar.uba.fi.ingsoft1.product_example.Products.Product;
import ar.uba.fi.ingsoft1.product_example.Products.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class MenuSectionServiceTest {

    @Mock
    private MenuSectionRepository menuSectionRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private ComboRepository comboRepository;

    @InjectMocks
    private MenuSectionService menuSectionService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testGetAllMenuSections() {
        MenuSection section = new MenuSection("Entradas", "Sección de entradas");
        section.setId(1L);

        when(menuSectionRepository.findAll()).thenReturn(List.of(section));

        List<MenuSectionDTO> result = menuSectionService.getAllMenuSections();

        assertEquals(1, result.size());
        assertEquals("Entradas", result.get(0).label());
    }

    @Test
    void testGetMenuSectionById_Found() {
        MenuSection section = new MenuSection("Entradas", "Sección de entradas");
        section.setId(1L);

        when(menuSectionRepository.findById(1L)).thenReturn(Optional.of(section));

        Optional<MenuSectionDTO> result = menuSectionService.getMenuSectionById(1L);

        assertTrue(result.isPresent());
        assertEquals("Entradas", result.get().label());
    }

    @Test
    void testGetMenuSectionById_NotFound() {
        when(menuSectionRepository.findById(1L)).thenReturn(Optional.empty());

        Optional<MenuSectionDTO> result = menuSectionService.getMenuSectionById(1L);

        assertFalse(result.isPresent());
    }

    @Test
    void testCreateMenuSection() {
        MenuSectionCreateDTO dto = new MenuSectionCreateDTO("Postres", "Sección de postres");
        MenuSection section = dto.asMenuSection();
        section.setId(2L);

        when(menuSectionRepository.save(any(MenuSection.class))).thenReturn(section);

        Optional<MenuSectionDTO> result = menuSectionService.createMenuSection(dto);

        assertTrue(result.isPresent());
        assertEquals("Postres", result.get().label());
    }

    @Test
    void testUpdateMenuSection_Found() {
        MenuSection section = new MenuSection("Viejo Label", "Vieja descripción");
        section.setId(1L);

        MenuSectionCreateDTO dto = new MenuSectionCreateDTO("Nuevo Label", "Nueva descripción");

        when(menuSectionRepository.findById(1L)).thenReturn(Optional.of(section));
        when(menuSectionRepository.save(any(MenuSection.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Optional<MenuSectionDTO> result = menuSectionService.updateMenuSection(1L, dto);

        assertTrue(result.isPresent());
        assertEquals("Nuevo Label", result.get().label());
        assertEquals("Nueva descripción", result.get().description());
    }

    @Test
    void testUpdateMenuSection_NotFound() {
        MenuSectionCreateDTO dto = new MenuSectionCreateDTO("Label", "Descripción");

        when(menuSectionRepository.findById(999L)).thenReturn(Optional.empty());

        Optional<MenuSectionDTO> result = menuSectionService.updateMenuSection(999L, dto);

        assertFalse(result.isPresent());
    }

    @Test
    void testDeleteMenuSection_Exists() {
        when(menuSectionRepository.existsById(1L)).thenReturn(true);

        boolean result = menuSectionService.deleteMenuSection(1L);

        verify(menuSectionRepository).deleteById(1L);
        assertTrue(result);
    }

    @Test
    void testDeleteMenuSection_NotExists() {
        when(menuSectionRepository.existsById(1L)).thenReturn(false);

        boolean result = menuSectionService.deleteMenuSection(1L);

        verify(menuSectionRepository, never()).deleteById(any());
        assertFalse(result);
    }

    @Test
    void testAddProductsToMenuSection_Success() {
        MenuSection section = new MenuSection("Combos", "Sección de combos");
        section.setId(1L);
        section.setProducts(new ArrayList<>()); // Simular que no tiene productos al principio

        Product p1 = new Product();
        p1.setId(10L);

        Product p2 = new Product();
        p2.setId(20L);

        when(menuSectionRepository.findById(1L)).thenReturn(Optional.of(section));
        when(productRepository.findAllById(List.of(10L, 20L))).thenReturn(List.of(p1, p2));
        when(menuSectionRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        Optional<MenuSectionDTO> result = menuSectionService.addProductsToMenuSection(1L, List.of(10L, 20L));

        assertTrue(result.isPresent());
        assertEquals(2, result.get().products().size());
    }

    @Test
    void testAddProductsToMenuSection_MenuSectionNotFound() {
        when(menuSectionRepository.findById(999L)).thenReturn(Optional.empty());

        Optional<MenuSectionDTO> result = menuSectionService.addProductsToMenuSection(999L, List.of(1L, 2L));

        assertFalse(result.isPresent());
    }

    @Test
    void testAddCombosToMenuSection_Success() {
        MenuSection section = new MenuSection("Combos", "Sección de combos");
        section.setId(1L);
        section.setCombos(new ArrayList<>()); // vacío al inicio

        Combo c1 = new Combo();
        c1.setId(10L);

        Combo c2 = new Combo();
        c2.setId(20L);

        when(menuSectionRepository.findById(1L)).thenReturn(Optional.of(section));
        when(comboRepository.findAllById(List.of(10L, 20L))).thenReturn(List.of(c1, c2));
        when(menuSectionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Optional<MenuSectionDTO> result =
                menuSectionService.addCombosToMenuSection(1L, List.of(10L, 20L));

        assertTrue(result.isPresent());
        assertEquals(2, result.get().combos().size());
    }

    @Test
    void testAddCombosToMenuSection_MenuSectionNotFound() {
        when(menuSectionRepository.findById(999L)).thenReturn(Optional.empty());

        Optional<MenuSectionDTO> result =
                menuSectionService.addCombosToMenuSection(999L, List.of(1L, 2L));

        assertFalse(result.isPresent());

        verify(comboRepository, never()).findAllById(any());
        verify(menuSectionRepository, never()).save(any());
    }

    @Test
    void testAddCombosToMenuSection_NoDuplicates() {
        MenuSection section = new MenuSection("Combos", "Sección de combos");
        section.setId(1L);

        Combo existing = new Combo();
        existing.setId(10L);

        List<Combo> current = new ArrayList<>();
        current.add(existing);
        section.setCombos(current);

        Combo newCombo = new Combo();
        newCombo.setId(20L);

        when(menuSectionRepository.findById(1L)).thenReturn(Optional.of(section));
        when(comboRepository.findAllById(List.of(10L, 20L)))
                .thenReturn(List.of(existing, newCombo));
        when(menuSectionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Optional<MenuSectionDTO> result =
                menuSectionService.addCombosToMenuSection(1L, List.of(10L, 20L));

        assertTrue(result.isPresent());
        assertEquals(2, result.get().combos().size());
    }
}
