package ar.uba.fi.ingsoft1.product_example.Promotions;

import java.math.BigDecimal;
import java.util.Set;
import java.time.DayOfWeek;

public class ThresholdPromotionCreateDTO extends PromotionCreateDTO {
    private BigDecimal threshold;
    private BigDecimal discountAmount;

    public ThresholdPromotionCreateDTO(String name, String description, boolean active,
                                       Set<Long> productIds, Set<Long> comboIds,
                                       BigDecimal threshold, BigDecimal discountAmount,
                                       Set<DayOfWeek> validDays) {
        super(name, description, active, productIds, comboIds, validDays);
        this.threshold = threshold;
        this.discountAmount = discountAmount;
    }

    public BigDecimal getThreshold() { return threshold; }
    public BigDecimal getDiscountAmount() { return discountAmount; }

    @Override
    public Promotion toEntity(PromotionService promotionService) {
        ThresholdDiscountPromotion promo = new ThresholdDiscountPromotion();
        promo.setName(getName());
        promo.setDescription(getDescription());
        promo.setActive(isActive());
        promo.setThreshold(threshold);
        promo.setDiscount(discountAmount);
        promo.setProducts(promotionService.findProducts(getProductIds()));
        promo.setCombos(promotionService.findCombos(getComboIds()));
        promo.setValidDays(getValidDays());
        return promo;
    }
}
