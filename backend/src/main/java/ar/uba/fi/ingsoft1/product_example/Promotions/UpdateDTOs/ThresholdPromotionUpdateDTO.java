package ar.uba.fi.ingsoft1.product_example.Promotions;

import java.math.BigDecimal;
import java.util.Set;
import java.time.DayOfWeek;

public class ThresholdPromotionUpdateDTO extends PromotionUpdateDTO {
    private BigDecimal threshold;
    private BigDecimal discountAmount;

    public ThresholdPromotionUpdateDTO(String name, String description, Boolean active,
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
    public void applyTo(Promotion promotion, PromotionService promotionService) {
        if (!(promotion instanceof ThresholdDiscountPromotion p)) {
            throw new IllegalArgumentException("Promotion must be ThresholdPromotionUpdateDTO");
        }

        if (getName() != null) p.setName(getName());
        if (getDescription() != null) p.setDescription(getDescription());
        if (getActive() != null) p.setActive(getActive());

        if (getProductIds() != null) p.setProducts(promotionService.findProducts(getProductIds()));
        if (getComboIds() != null) p.setCombos(promotionService.findCombos(getComboIds()));
        if (getValidDays() != null) p.setValidDays(getValidDays());

        if (threshold != null) p.setThreshold(threshold);
        if (discountAmount != null) p.setDiscount(discountAmount);
    }
}
