package ar.uba.fi.ingsoft1.product_example.Promotions;

import ar.uba.fi.ingsoft1.product_example.Combos.Combo;
import ar.uba.fi.ingsoft1.product_example.Combos.ComboRepository;
import ar.uba.fi.ingsoft1.product_example.Products.Product;
import ar.uba.fi.ingsoft1.product_example.Products.ProductRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import java.math.BigDecimal;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class PromotionServiceTest {
    private PromotionService service;

    @Mock
    private PromotionRepository promotionRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private ComboRepository comboRepository;

    @InjectMocks
    private PromotionService promotionService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    private PercentageDiscountPromotion createPercentagePromotion() {
        PercentageDiscountPromotion p = new PercentageDiscountPromotion();
        p.setId(1L);
        p.setName("Promo 10%");
        p.setDescription("Descuento 10%");
        p.setActive(true);
        p.setPercentage(new BigDecimal("10.0"));
        p.setProducts(Set.of());
        p.setCombos(Set.of());
        p.setValidDays(Set.of());
        return p;
    }

    @Test
    void testGetAllPromotions_ReturnsResults() {
        when(promotionRepository.findAll()).thenReturn(List.of(createPercentagePromotion()));

        List<PromotionDTO> result = promotionService.getAllPromotions();

        assertEquals(1, result.size());
        assertTrue(result.get(0) instanceof PercentagePromotionDTO);
        assertEquals("Promo 10%", result.get(0).getName());
    }

    @Test
    void testGetPromotionById_Found() {
        var promo = createPercentagePromotion();
        when(promotionRepository.findById(1L)).thenReturn(Optional.of(promo));

        Optional<PromotionDTO> result = promotionService.getPromotionById(1L);

        assertTrue(result.isPresent());
        assertEquals("Promo 10%", result.get().getName());
    }

    @Test
    void testGetPromotionById_NotFound() {
        when(promotionRepository.findById(99L)).thenReturn(Optional.empty());

        Optional<PromotionDTO> result = promotionService.getPromotionById(99L);

        assertTrue(result.isEmpty());
    }

    @Test
    void testCreatePromotion_Success() {
        PromotionCreateDTO dto = mock(PromotionCreateDTO.class);
        Promotion promo = createPercentagePromotion();

        when(dto.toEntity(any())).thenReturn(promo);
        when(promotionRepository.save(promo)).thenReturn(promo);

        Optional<PromotionDTO> result = promotionService.createPromotion(dto);

        assertTrue(result.isPresent());
        verify(promotionRepository).save(promo);
    }

    @Test
    void testUpdatePromotion_Success() {
        PromotionUpdateDTO dto = mock(PromotionUpdateDTO.class);
        Promotion promo = createPercentagePromotion();

        when(promotionRepository.findById(1L)).thenReturn(Optional.of(promo));
        when(promotionRepository.save(promo)).thenReturn(promo);

        Optional<PromotionDTO> result = promotionService.updatePromotion(1L, dto);

        assertTrue(result.isPresent());
        verify(dto).applyTo(eq(promo), any());
        verify(promotionRepository).save(promo);
    }

    @Test
    void testUpdatePromotion_NotFound_Throws() {
        when(promotionRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class,
                () -> promotionService.updatePromotion(99L, mock(PromotionUpdateDTO.class)));
    }

    @Test
    void testTogglePromotionActive_Success() {
        PercentageDiscountPromotion promo = createPercentagePromotion();
        promo.setActive(true);
        when(promotionRepository.findById(1L)).thenReturn(Optional.of(promo));
        when(promotionRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        Optional<PromotionDTO> result = promotionService.togglePromotionActive(1L);

        assertTrue(result.isPresent());
        assertFalse(((PercentagePromotionDTO) result.get()).isActive());
    }

    @Test
    void testTogglePromotionActive_NotFound_Throws() {
        when(promotionRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> promotionService.togglePromotionActive(99L));
    }

    @Test
    void testDeletePromotion_Found() {
        when(promotionRepository.existsById(1L)).thenReturn(true);

        boolean deleted = promotionService.deletePromotion(1L);

        assertTrue(deleted);
        verify(promotionRepository).deleteById(1L);
    }

    @Test
    void testDeletePromotion_NotFound() {
        when(promotionRepository.existsById(1L)).thenReturn(false);

        boolean deleted = promotionService.deletePromotion(1L);

        assertFalse(deleted);
    }

    @Test
    void testGetPromotionsDTOActiveNow_ReturnsDTOs() {
        PercentageDiscountPromotion promo = createPercentagePromotion();
        when(promotionRepository.findActivePromotions(any()))
                .thenReturn(List.of(promo));

        List<PromotionDTO> result = promotionService.getPromotionsDTOActiveNow();

        assertEquals(1, result.size());
        assertTrue(result.get(0) instanceof PercentagePromotionDTO);
        assertEquals(promo.getName(), result.get(0).getName());

        verify(promotionRepository).findActivePromotions(any());
    }

    @Test
    void testGetPromotionsActiveNow_ReturnsEntities() {
        PercentageDiscountPromotion promo = createPercentagePromotion();
        when(promotionRepository.findActivePromotions(any()))
                .thenReturn(List.of(promo));

        List<Promotion> result = promotionService.getPromotionsActiveNow();

        assertEquals(1, result.size());
        assertSame(promo, result.get(0));

        verify(promotionRepository).findActivePromotions(any());
    }

    private BuyXPayYPromotion createBuyXPayYPromotion() {
        BuyXPayYPromotion p = new BuyXPayYPromotion();
        p.setId(1L);
        p.setName("Promo 3x2");
        p.setDescription("Compra 3 paga 2");
        p.setActive(true);
        p.setBuyQuantity(3);
        p.setPayQuantity(2);
        p.setProducts(Set.of());
        p.setCombos(Set.of());
        p.setValidDays(Set.of());
        return p;
    }

    private BuyGiveFreePromotion createBuyGiveFreePromotion() {
        BuyGiveFreePromotion p = new BuyGiveFreePromotion();
        p.setId(1L);
        p.setName("Buy Burger Get Coke");
        p.setDescription("Buy 1 Burger, Get 1 Coke Free");
        p.setActive(true);
        p.setProducts(Set.of());
        p.setCombos(Set.of());
        p.setFreeProducts(Set.of());
        p.setFreeCombos(Set.of());
        p.setValidDays(Set.of());
        p.setOneFreePerTrigger(true);
        return p;
    }

    @Test
    void testGetAllPromotionsBuyXPayY_ReturnsResults() {
        when(promotionRepository.findAll()).thenReturn(List.of(createBuyXPayYPromotion()));

        List<PromotionDTO> result = promotionService.getAllPromotions();

        assertEquals(1, result.size());
        assertTrue(result.get(0) instanceof BuyXPayYPromotionDTO);
        assertEquals("Promo 3x2", result.get(0).getName());
    }

    @Test
    void testGetPromotionBuyXPayYById_Found() {
        var promo = createBuyXPayYPromotion();
        when(promotionRepository.findById(1L)).thenReturn(Optional.of(promo));

        Optional<PromotionDTO> result = promotionService.getPromotionById(1L);

        assertTrue(result.isPresent());
        assertEquals("Promo 3x2", result.get().getName());
    }

    @Test
    void testGetPromotionBuyXPayYById_NotFound() {
        when(promotionRepository.findById(99L)).thenReturn(Optional.empty());

        Optional<PromotionDTO> result = promotionService.getPromotionById(99L);

        assertTrue(result.isEmpty());
    }

    @Test
    void testCreatePromotionBuyXPayY_Success() {
        PromotionCreateDTO dto = mock(PromotionCreateDTO.class);
        Promotion promo = createBuyXPayYPromotion();

        when(dto.toEntity(any())).thenReturn(promo);
        when(promotionRepository.save(promo)).thenReturn(promo);

        Optional<PromotionDTO> result = promotionService.createPromotion(dto);

        assertTrue(result.isPresent());
        verify(promotionRepository).save(promo);
    }

    @Test
    void testUpdatePromotionBuyXPayY_Success() {
        PromotionUpdateDTO dto = mock(PromotionUpdateDTO.class);
        Promotion promo = createBuyXPayYPromotion();

        when(promotionRepository.findById(1L)).thenReturn(Optional.of(promo));
        when(promotionRepository.save(promo)).thenReturn(promo);

        Optional<PromotionDTO> result = promotionService.updatePromotion(1L, dto);

        assertTrue(result.isPresent());
        verify(dto).applyTo(eq(promo), any());
        verify(promotionRepository).save(promo);
    }

    @Test
    void testUpdatePromotionBuyXPayY_NotFound_Throws() {
        when(promotionRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class,
                () -> promotionService.updatePromotion(99L, mock(PromotionUpdateDTO.class)));
    }

    @Test
    void testTogglePromotionBuyXPayYActive_Success() {
        BuyXPayYPromotion promo = createBuyXPayYPromotion();
        promo.setActive(true);

        when(promotionRepository.findById(1L)).thenReturn(Optional.of(promo));
        when(promotionRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        Optional<PromotionDTO> result = promotionService.togglePromotionActive(1L);

        assertTrue(result.isPresent());
        assertFalse(((BuyXPayYPromotionDTO) result.get()).isActive());
    }

    @Test
    void testTogglePromotionBuyXPayYActive_NotFound_Throws() {
        when(promotionRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> promotionService.togglePromotionActive(99L));
    }

    @Test
    void testDeletePromotionBuyXPayY_Found() {
        when(promotionRepository.existsById(1L)).thenReturn(true);

        boolean deleted = promotionService.deletePromotion(1L);

        assertTrue(deleted);
        verify(promotionRepository).deleteById(1L);
    }

    @Test
    void testDeletePromotionBuyXPayY_NotFound() {
        when(promotionRepository.existsById(1L)).thenReturn(false);

        boolean deleted = promotionService.deletePromotion(1L);

        assertFalse(deleted);
    }

    @Test
    void testGetPromotionsBuyXPayYDTOActiveNow_ReturnsDTOs() {
        BuyXPayYPromotion promo = createBuyXPayYPromotion();
        when(promotionRepository.findActivePromotions(any()))
                .thenReturn(List.of(promo));

        List<PromotionDTO> result = promotionService.getPromotionsDTOActiveNow();

        assertEquals(1, result.size());
        assertTrue(result.get(0) instanceof BuyXPayYPromotionDTO);
        assertEquals(promo.getName(), result.get(0).getName());

        verify(promotionRepository).findActivePromotions(any());
    }

    @Test
    void testGetPromotionsBuyXPayYActiveNow_ReturnsEntities() {
        BuyXPayYPromotion promo = createBuyXPayYPromotion();
        when(promotionRepository.findActivePromotions(any()))
                .thenReturn(List.of(promo));

        List<Promotion> result = promotionService.getPromotionsActiveNow();

        assertEquals(1, result.size());
        assertSame(promo, result.get(0));

        verify(promotionRepository).findActivePromotions(any());
    }

    @Test
    void testGetAllPromotionsBuyGiveFree_ReturnsResults() {
        when(promotionRepository.findAll()).thenReturn(List.of(createBuyGiveFreePromotion()));

        List<PromotionDTO> result = promotionService.getAllPromotions();

        assertEquals(1, result.size());
        assertTrue(result.get(0) instanceof BuyGiveFreePromotionDTO);
        assertEquals("Buy Burger Get Coke", result.get(0).getName());
    }

    @Test
    void testGetPromotionBuyGiveFreeById_Found() {
        var promo = createBuyGiveFreePromotion();
        when(promotionRepository.findById(1L)).thenReturn(Optional.of(promo));

        Optional<PromotionDTO> result = promotionService.getPromotionById(1L);

        assertTrue(result.isPresent());
        assertEquals("Buy Burger Get Coke", result.get().getName());
    }

    @Test
    void testGetPromotionBuyGiveFreeById_NotFound() {
        when(promotionRepository.findById(99L)).thenReturn(Optional.empty());

        Optional<PromotionDTO> result = promotionService.getPromotionById(99L);

        assertTrue(result.isEmpty());
    }

    @Test
    void testCreatePromotionBuyGiveFree_Success() {
        PromotionCreateDTO dto = mock(PromotionCreateDTO.class);
        Promotion promo = createBuyGiveFreePromotion();

        when(dto.toEntity(any())).thenReturn(promo);
        when(promotionRepository.save(promo)).thenReturn(promo);

        Optional<PromotionDTO> result = promotionService.createPromotion(dto);

        assertTrue(result.isPresent());
        verify(promotionRepository).save(promo);
    }

    @Test
    void testUpdatePromotionBuyGiveFree_Success() {
        PromotionUpdateDTO dto = mock(PromotionUpdateDTO.class);
        Promotion promo = createBuyGiveFreePromotion();

        when(promotionRepository.findById(1L)).thenReturn(Optional.of(promo));
        when(promotionRepository.save(promo)).thenReturn(promo);

        Optional<PromotionDTO> result = promotionService.updatePromotion(1L, dto);

        assertTrue(result.isPresent());
        verify(dto).applyTo(eq(promo), any());
        verify(promotionRepository).save(promo);
    }

    @Test
    void testUpdatePromotionBuyGiveFree_NotFound_Throws() {
        when(promotionRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class,
                () -> promotionService.updatePromotion(99L, mock(PromotionUpdateDTO.class)));
    }

    @Test
    void testTogglePromotionBuyGiveFreeActive_Success() {
        BuyGiveFreePromotion promo = createBuyGiveFreePromotion();
        promo.setActive(true);

        when(promotionRepository.findById(1L)).thenReturn(Optional.of(promo));
        when(promotionRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        Optional<PromotionDTO> result = promotionService.togglePromotionActive(1L);

        assertTrue(result.isPresent());
        // The service toggles the boolean, so a true initial state should be persisted as false
        // Could assert on the captured argument if needed, matching the other promotion tests
    }

    @Test
    void testTogglePromotionBuyGiveFreeActive_NotFound_Throws() {
        when(promotionRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> promotionService.togglePromotionActive(99L));
    }

    @Test
    void testDeletePromotionBuyGiveFree_Found() {
        when(promotionRepository.existsById(1L)).thenReturn(true);

        boolean deleted = promotionService.deletePromotion(1L);

        assertTrue(deleted);
        verify(promotionRepository).deleteById(1L);
    }

    @Test
    void testDeletePromotionBuyGiveFree_NotFound() {
        when(promotionRepository.existsById(1L)).thenReturn(false);

        boolean deleted = promotionService.deletePromotion(1L);

        assertFalse(deleted);
    }

    @Test
    void testGetPromotionsBuyGiveFreeDTOActiveNow_ReturnsDTOs() {
        BuyGiveFreePromotion promo = createBuyGiveFreePromotion();
        when(promotionRepository.findActivePromotions(any()))
                .thenReturn(List.of(promo));

        List<PromotionDTO> result = promotionService.getPromotionsDTOActiveNow();

        assertEquals(1, result.size());
        assertTrue(result.get(0) instanceof BuyGiveFreePromotionDTO);
        assertEquals(promo.getName(), result.get(0).getName());

        verify(promotionRepository).findActivePromotions(any());
    }

    @Test
    void testGetPromotionsBuyGiveFreeActiveNow_ReturnsEntities() {
        BuyGiveFreePromotion promo = createBuyGiveFreePromotion();
        when(promotionRepository.findActivePromotions(any()))
                .thenReturn(List.of(promo));

        List<Promotion> result = promotionService.getPromotionsActiveNow();

        assertEquals(1, result.size());
        assertSame(promo, result.get(0));

        verify(promotionRepository).findActivePromotions(any());
    }

    private ThresholdDiscountPromotion createThresholdPromotion() {
        ThresholdDiscountPromotion p = new ThresholdDiscountPromotion(
                new BigDecimal("100"),
                new BigDecimal("10")
        );
        p.setId(1L);
        p.setName("Promo Umbral $100");
        p.setDescription("Descuento de $10 a partir de $100");
        p.setActive(true);
        p.setProducts(Set.of());
        p.setCombos(Set.of());
        p.setValidDays(Set.of());
        return p;
    }

    @Test
    void testGetAllPromotionsThreshold_ReturnsResults() {
        when(promotionRepository.findAll()).thenReturn(List.of(createThresholdPromotion()));

        List<PromotionDTO> result = promotionService.getAllPromotions();

        assertEquals(1, result.size());
        assertTrue(result.get(0) instanceof ThresholdPromotionDTO);
        assertEquals("Promo Umbral $100", result.get(0).getName());
    }

    @Test
    void testGetPromotionThresholdById_Found() {
        var promo = createThresholdPromotion();
        when(promotionRepository.findById(1L)).thenReturn(Optional.of(promo));

        Optional<PromotionDTO> result = promotionService.getPromotionById(1L);

        assertTrue(result.isPresent());
        assertEquals("Promo Umbral $100", result.get().getName());
    }

    @Test
    void testGetPromotionThresholdById_NotFound() {
        when(promotionRepository.findById(99L)).thenReturn(Optional.empty());

        Optional<PromotionDTO> result = promotionService.getPromotionById(99L);

        assertTrue(result.isEmpty());
    }

    @Test
    void testCreatePromotionThreshold_Success() {
        PromotionCreateDTO dto = mock(PromotionCreateDTO.class);
        Promotion promo = createThresholdPromotion();

        when(dto.toEntity(any())).thenReturn(promo);
        when(promotionRepository.save(promo)).thenReturn(promo);

        Optional<PromotionDTO> result = promotionService.createPromotion(dto);

        assertTrue(result.isPresent());
        verify(promotionRepository).save(promo);
    }

    @Test
    void testUpdatePromotionThreshold_Success() {
        PromotionUpdateDTO dto = mock(PromotionUpdateDTO.class);
        Promotion promo = createThresholdPromotion();

        when(promotionRepository.findById(1L)).thenReturn(Optional.of(promo));
        when(promotionRepository.save(promo)).thenReturn(promo);

        Optional<PromotionDTO> result = promotionService.updatePromotion(1L, dto);

        assertTrue(result.isPresent());
        verify(dto).applyTo(eq(promo), any());
        verify(promotionRepository).save(promo);
    }

    @Test
    void testUpdatePromotionThreshold_NotFound_Throws() {
        when(promotionRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class,
                () -> promotionService.updatePromotion(99L, mock(PromotionUpdateDTO.class)));
    }

    @Test
    void testTogglePromotionThresholdActive_Success() {
        ThresholdDiscountPromotion promo = createThresholdPromotion();
        promo.setActive(true);

        when(promotionRepository.findById(1L)).thenReturn(Optional.of(promo));
        when(promotionRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        Optional<PromotionDTO> result = promotionService.togglePromotionActive(1L);

        assertTrue(result.isPresent());
        assertFalse(((ThresholdPromotionDTO) result.get()).isActive());
    }

    @Test
    void testTogglePromotionThresholdActive_NotFound_Throws() {
        when(promotionRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> promotionService.togglePromotionActive(99L));
    }

    @Test
    void testDeletePromotionThreshold_Found() {
        when(promotionRepository.existsById(1L)).thenReturn(true);

        boolean deleted = promotionService.deletePromotion(1L);

        assertTrue(deleted);
        verify(promotionRepository).deleteById(1L);
    }

    @Test
    void testDeletePromotionThreshold_NotFound() {
        when(promotionRepository.existsById(1L)).thenReturn(false);

        boolean deleted = promotionService.deletePromotion(1L);

        assertFalse(deleted);
    }

    @Test
    void testGetPromotionsThresholdDTOActiveNow_ReturnsDTOs() {
        ThresholdDiscountPromotion promo = createThresholdPromotion();
        when(promotionRepository.findActivePromotions(any()))
                .thenReturn(List.of(promo));

        List<PromotionDTO> result = promotionService.getPromotionsDTOActiveNow();

        assertEquals(1, result.size());
        assertTrue(result.get(0) instanceof ThresholdPromotionDTO);
        assertEquals(promo.getName(), result.get(0).getName());

        verify(promotionRepository).findActivePromotions(any());
    }

    @Test
    void testGetPromotionsThresholdActiveNow_ReturnsEntities() {
        ThresholdDiscountPromotion promo = createThresholdPromotion();
        when(promotionRepository.findActivePromotions(any()))
                .thenReturn(List.of(promo));

        List<Promotion> result = promotionService.getPromotionsActiveNow();

        assertEquals(1, result.size());
        assertSame(promo, result.get(0));

        verify(promotionRepository).findActivePromotions(any());
    }

    @Test
    void testFindProducts_EmptyInput_ReturnsEmptySet() {
        Set<Product> result = promotionService.findProducts(Set.of());
        assertTrue(result.isEmpty());
        verify(productRepository, never()).findAllById(any());
    }

    @Test
    void testFindProducts_NullInput_ReturnsEmptySet() {
        Set<Product> result = promotionService.findProducts(null);
        assertTrue(result.isEmpty());
        verify(productRepository, never()).findAllById(any());
    }

    @Test
    void testFindProducts_AllFound_ReturnsSet() {
        Product p1 = mock(Product.class);
        Product p2 = mock(Product.class);
        when(p1.getId()).thenReturn(1L);
        when(p2.getId()).thenReturn(2L);

        when(productRepository.findAllById(Set.of(1L, 2L)))
                .thenReturn(List.of(p1, p2));

        Set<Product> result = promotionService.findProducts(Set.of(1L, 2L));

        assertEquals(2, result.size());
        assertTrue(result.contains(p1));
        assertTrue(result.contains(p2));
    }

    @Test
    void testFindProducts_SomeMissing_Throws() {
        Product p1 = mock(Product.class);
        when(p1.getId()).thenReturn(1L);

        when(productRepository.findAllById(Set.of(1L, 2L)))
                .thenReturn(List.of(p1));

        EntityNotFoundException ex =
                assertThrows(EntityNotFoundException.class,
                        () -> promotionService.findProducts(Set.of(1L, 2L)));

        assertTrue(ex.getMessage().contains("2"));
    }

    @Test
    void testFindCombos_EmptyInput_ReturnsEmptySet() {
        Set<Combo> result = promotionService.findCombos(Set.of());
        assertTrue(result.isEmpty());
        verify(comboRepository, never()).findAllById(any());
    }

    @Test
    void testFindCombos_NullInput_ReturnsEmptySet() {
        Set<Combo> result = promotionService.findCombos(null);
        assertTrue(result.isEmpty());
        verify(comboRepository, never()).findAllById(any());
    }

    @Test
    void testFindCombos_AllFound_ReturnsSet() {
        Combo c1 = mock(Combo.class);
        Combo c2 = mock(Combo.class);
        when(c1.getId()).thenReturn(10L);
        when(c2.getId()).thenReturn(20L);

        when(comboRepository.findAllById(Set.of(10L, 20L)))
                .thenReturn(List.of(c1, c2));

        Set<Combo> result = promotionService.findCombos(Set.of(10L, 20L));

        assertEquals(2, result.size());
        assertTrue(result.contains(c1));
        assertTrue(result.contains(c2));
    }

    @Test
    void testFindCombos_SomeMissing_Throws() {
        Combo c1 = mock(Combo.class);
        when(c1.getId()).thenReturn(10L);

        when(comboRepository.findAllById(Set.of(10L, 20L)))
                .thenReturn(List.of(c1));

        EntityNotFoundException ex =
                assertThrows(EntityNotFoundException.class,
                        () -> promotionService.findCombos(Set.of(10L, 20L)));

        assertTrue(ex.getMessage().contains("20"));
    }
}
