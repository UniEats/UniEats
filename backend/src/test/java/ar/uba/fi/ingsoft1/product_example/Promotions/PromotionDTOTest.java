package ar.uba.fi.ingsoft1.product_example.Promotions;

import ar.uba.fi.ingsoft1.product_example.Combos.Combo;
import ar.uba.fi.ingsoft1.product_example.Products.Product;
import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.util.EnumSet;
import java.util.HashSet;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PromotionDTOTest {

    @Mock
    private PromotionService promotionService;

    @Test
    void thresholdCreateDto_toEntity_ShouldMapFields() {
        Set<Long> productIds = Set.of(1L);
        Set<Long> comboIds = Set.of(10L);
        Set<DayOfWeek> validDays = EnumSet.of(DayOfWeek.MONDAY, DayOfWeek.WEDNESDAY);

        ThresholdPromotionCreateDTO dto = new ThresholdPromotionCreateDTO(
                "Threshold",
                "Spend 100 save 15",
                true,
                productIds,
                comboIds,
                new BigDecimal("100.00"),
                new BigDecimal("15.00"),
                validDays
        );

        when(promotionService.findProducts(productIds)).thenReturn(new HashSet<>(Set.of(product(1L, "Burger"))));
        when(promotionService.findCombos(comboIds)).thenReturn(new HashSet<>(Set.of(combo(10L, "Lunch"))));

        ThresholdDiscountPromotion promotion = (ThresholdDiscountPromotion) dto.toEntity(promotionService);

        assertEquals("Threshold", promotion.getName());
        assertEquals(new BigDecimal("100.00"), promotion.getThreshold());
        assertEquals(new BigDecimal("15.00"), promotion.getDiscount());
        assertEquals(validDays, promotion.getValidDays());
        assertEquals(1, promotion.getProducts().size());
        assertEquals(1, promotion.getCombos().size());
    }

    @Test
    void thresholdUpdateDto_applyTo_ShouldUpdateEntity() {
        ThresholdDiscountPromotion promotion = new ThresholdDiscountPromotion();
        promotion.setName("Old");
        promotion.setDescription("Old desc");
        promotion.setActive(false);
        promotion.setThreshold(new BigDecimal("50.00"));
        promotion.setDiscount(new BigDecimal("5.00"));
        promotion.setProducts(new HashSet<>());
        promotion.setCombos(new HashSet<>());
        promotion.setValidDays(EnumSet.of(DayOfWeek.MONDAY));

        Set<Long> productIds = Set.of(1L);
        Set<Long> comboIds = Set.of(10L);
        Set<DayOfWeek> newDays = EnumSet.of(DayOfWeek.FRIDAY);

        ThresholdPromotionUpdateDTO dto = new ThresholdPromotionUpdateDTO(
                "New",
                "Updated",
                true,
                productIds,
                comboIds,
                new BigDecimal("75.00"),
                new BigDecimal("12.00"),
                newDays
        );

        when(promotionService.findProducts(productIds)).thenReturn(new HashSet<>(Set.of(product(1L, "Burger"))));
        when(promotionService.findCombos(comboIds)).thenReturn(new HashSet<>(Set.of(combo(10L, "Lunch"))));

        dto.applyTo(promotion, promotionService);

        assertEquals("New", promotion.getName());
        assertEquals("Updated", promotion.getDescription());
        assertTrue(promotion.isActive());
        assertEquals(new BigDecimal("75.00"), promotion.getThreshold());
        assertEquals(new BigDecimal("12.00"), promotion.getDiscount());
        assertEquals(newDays, promotion.getValidDays());
        assertEquals(1, promotion.getProducts().size());
        assertEquals(1, promotion.getCombos().size());
    }

    @Test
    void percentageCreateDto_toEntity_ShouldMapFields() {
        Set<Long> productIds = Set.of(1L);
        Set<Long> comboIds = Set.of(2L);
        Set<DayOfWeek> validDays = EnumSet.of(DayOfWeek.TUESDAY);

        PercentagePromotionCreateDTO dto = new PercentagePromotionCreateDTO(
                "Percentage",
                "15 off",
                true,
                productIds,
                comboIds,
                new BigDecimal("15"),
                validDays
        );

        when(promotionService.findProducts(productIds)).thenReturn(new HashSet<>(Set.of(product(1L, "Burger"))));
        when(promotionService.findCombos(comboIds)).thenReturn(new HashSet<>(Set.of(combo(2L, "Combo"))));

        PercentageDiscountPromotion promotion = (PercentageDiscountPromotion) dto.toEntity(promotionService);

        assertEquals(new BigDecimal("15"), promotion.getPercentage());
        assertEquals(validDays, promotion.getValidDays());
        assertEquals(1, promotion.getProducts().size());
        assertEquals(1, promotion.getCombos().size());
    }

    @Test
    void percentageUpdateDto_applyTo_ShouldUpdateEntity() {
        PercentageDiscountPromotion promotion = new PercentageDiscountPromotion();
        promotion.setName("Old");
        promotion.setDescription("Old desc");
        promotion.setActive(false);
        promotion.setPercentage(new BigDecimal("5"));
        promotion.setProducts(new HashSet<>());
        promotion.setCombos(new HashSet<>());
        promotion.setValidDays(EnumSet.of(DayOfWeek.MONDAY));

        Set<Long> productIds = Set.of(1L);
        Set<Long> comboIds = Set.of(2L);
        Set<DayOfWeek> newDays = EnumSet.of(DayOfWeek.THURSDAY);

        PercentagePromotionUpdateDTO dto = new PercentagePromotionUpdateDTO(
                "New",
                "Updated",
                true,
                productIds,
                comboIds,
                new BigDecimal("12"),
                newDays
        );

        when(promotionService.findProducts(productIds)).thenReturn(new HashSet<>(Set.of(product(1L, "Burger"))));
        when(promotionService.findCombos(comboIds)).thenReturn(new HashSet<>(Set.of(combo(2L, "Combo"))));

        dto.applyTo(promotion, promotionService);

        assertEquals("New", promotion.getName());
        assertEquals("Updated", promotion.getDescription());
        assertTrue(promotion.isActive());
        assertEquals(new BigDecimal("12"), promotion.getPercentage());
        assertEquals(newDays, promotion.getValidDays());
        assertEquals(1, promotion.getProducts().size());
        assertEquals(1, promotion.getCombos().size());
    }

    @Test
    void buyXPayYCreateDto_toEntity_ShouldMapFields() {
        Set<Long> productIds = Set.of(1L);
        Set<Long> comboIds = Set.of(2L);
        Set<DayOfWeek> validDays = EnumSet.of(DayOfWeek.SATURDAY);

        BuyXPayYPromotionCreateDTO dto = new BuyXPayYPromotionCreateDTO(
                "Buy 3 Pay 2",
                "Lunch",
                true,
                productIds,
                comboIds,
                3,
                2,
                validDays
        );

        when(promotionService.findProducts(productIds)).thenReturn(new HashSet<>(Set.of(product(1L, "Burger"))));
        when(promotionService.findCombos(comboIds)).thenReturn(new HashSet<>(Set.of(combo(2L, "Combo"))));

        BuyXPayYPromotion promotion = (BuyXPayYPromotion) dto.toEntity(promotionService);

        assertEquals(3, promotion.getBuyQuantity());
        assertEquals(2, promotion.getPayQuantity());
        assertEquals(validDays, promotion.getValidDays());
    }

    @Test
    void buyXPayYUpdateDto_applyTo_ShouldUpdateEntity() {
        BuyXPayYPromotion promotion = new BuyXPayYPromotion();
        promotion.setName("Old");
        promotion.setDescription("Old");
        promotion.setActive(false);
        promotion.setBuyQuantity(2);
        promotion.setPayQuantity(2);
        promotion.setProducts(new HashSet<>());
        promotion.setCombos(new HashSet<>());
        promotion.setValidDays(EnumSet.of(DayOfWeek.MONDAY));

        Set<Long> productIds = Set.of(1L);
        Set<Long> comboIds = Set.of(2L);
        Set<DayOfWeek> newDays = EnumSet.of(DayOfWeek.TUESDAY);

        BuyXPayYPromotionUpdateDTO dto = new BuyXPayYPromotionUpdateDTO(
                "New",
                "Updated",
                true,
                productIds,
                comboIds,
                5,
                3,
                newDays
        );

        when(promotionService.findProducts(productIds)).thenReturn(new HashSet<>(Set.of(product(1L, "Burger"))));
        when(promotionService.findCombos(comboIds)).thenReturn(new HashSet<>(Set.of(combo(2L, "Combo"))));

        dto.applyTo(promotion, promotionService);

        assertEquals("New", promotion.getName());
        assertEquals("Updated", promotion.getDescription());
        assertTrue(promotion.isActive());
        assertEquals(5, promotion.getBuyQuantity());
        assertEquals(3, promotion.getPayQuantity());
        assertEquals(newDays, promotion.getValidDays());
    }

    @Test
    void buyGiveFreeCreateDto_toEntity_ShouldMapFields() {
        Set<Long> triggerProductIds = Set.of(1L);
        Set<Long> triggerComboIds = Set.of(2L);
        Set<Long> freeProductIds = Set.of(3L);
        Set<Long> freeComboIds = Set.of(4L);
        Set<DayOfWeek> validDays = EnumSet.of(DayOfWeek.SUNDAY);

        BuyGiveFreePromotionCreateDTO dto = new BuyGiveFreePromotionCreateDTO(
                "Buy Burger Get Fries",
                "desc",
                true,
                triggerProductIds,
                triggerComboIds,
                freeProductIds,
                freeComboIds,
                true,
                validDays
        );

        when(promotionService.findProducts(triggerProductIds)).thenReturn(new HashSet<>(Set.of(product(1L, "Burger"))));
        when(promotionService.findCombos(triggerComboIds)).thenReturn(new HashSet<>(Set.of(combo(2L, "Combo"))));
        when(promotionService.findProducts(freeProductIds)).thenReturn(new HashSet<>(Set.of(product(3L, "Fries"))));
        when(promotionService.findCombos(freeComboIds)).thenReturn(new HashSet<>(Set.of(combo(4L, "Dessert"))));

        BuyGiveFreePromotion promotion = (BuyGiveFreePromotion) dto.toEntity(promotionService);

        assertEquals(1, promotion.getProducts().size());
        assertEquals(1, promotion.getCombos().size());
        assertEquals(1, promotion.getFreeProducts().size());
        assertEquals(1, promotion.getFreeCombos().size());
        assertTrue(promotion.isOneFreePerTrigger());
        assertEquals(validDays, promotion.getValidDays());
    }

    @Test
    void buyGiveFreeUpdateDto_applyTo_ShouldUpdateEntity() {
        BuyGiveFreePromotion promotion = new BuyGiveFreePromotion();
        promotion.setName("Old");
        promotion.setDescription("Old desc");
        promotion.setActive(false);
        promotion.setProducts(new HashSet<>());
        promotion.setCombos(new HashSet<>());
        promotion.setFreeProducts(new HashSet<>());
        promotion.setFreeCombos(new HashSet<>());
        promotion.setValidDays(EnumSet.of(DayOfWeek.MONDAY));
        promotion.setOneFreePerTrigger(false);

        Set<Long> triggerProducts = Set.of(1L);
        Set<Long> triggerCombos = Set.of(2L);
        Set<Long> freeProducts = Set.of(3L);
        Set<Long> freeCombos = Set.of(4L);
        Set<DayOfWeek> newDays = EnumSet.of(DayOfWeek.THURSDAY);

        BuyGiveFreePromotionUpdateDTO dto = new BuyGiveFreePromotionUpdateDTO(
                "New",
                "Updated",
                true,
                triggerProducts,
                triggerCombos,
                freeProducts,
                freeCombos,
                true,
                newDays
        );

        when(promotionService.findProducts(triggerProducts)).thenReturn(new HashSet<>(Set.of(product(1L, "Burger"))));
        when(promotionService.findCombos(triggerCombos)).thenReturn(new HashSet<>(Set.of(combo(2L, "Combo"))));
        when(promotionService.findProducts(freeProducts)).thenReturn(new HashSet<>(Set.of(product(3L, "Fries"))));
        when(promotionService.findCombos(freeCombos)).thenReturn(new HashSet<>(Set.of(combo(4L, "Dessert"))));

        dto.applyTo(promotion, promotionService);

        assertEquals("New", promotion.getName());
        assertEquals("Updated", promotion.getDescription());
        assertTrue(promotion.isActive());
        assertTrue(promotion.isOneFreePerTrigger());
        assertEquals(newDays, promotion.getValidDays());
        assertEquals(1, promotion.getProducts().size());
        assertEquals(1, promotion.getCombos().size());
        assertEquals(1, promotion.getFreeProducts().size());
        assertEquals(1, promotion.getFreeCombos().size());
    }

    private Product product(Long id, String name) {
        Product product = new Product(name, "desc", new BigDecimal("10.00"));
        product.setId(id);
        return product;
    }

    private Combo combo(Long id, String name) {
        Combo combo = new Combo(name, "desc", new BigDecimal("20.00"));
        combo.setId(id);
        return combo;
    }
}
