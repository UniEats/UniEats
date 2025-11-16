package ar.uba.fi.ingsoft1.product_example.Promotions;

import java.math.BigDecimal;
import java.util.Set;
import java.time.DayOfWeek;

public class PercentagePromotionUpdateDTO extends PromotionUpdateDTO {
    private BigDecimal percentage;

    public PercentagePromotionUpdateDTO(String name, String description, Boolean active,
                                        Set<Long> productIds, Set<Long> comboIds,
                                        BigDecimal percentage, Set<DayOfWeek> validDays) {
        super(name, description, active, productIds, comboIds, validDays);
        this.percentage = percentage;
    }

    public BigDecimal getPercentage() { return percentage; }

    @Override
    public void applyTo(Promotion promotion, PromotionService promotionService) {
        if (!(promotion instanceof PercentageDiscountPromotion p)) {
            throw new IllegalArgumentException("Promotion must be PercentageDiscountPromotion");
        }

        if (percentage != null) p.setPercentage(percentage);
        if (getName() != null) p.setName(getName());
        if (getDescription() != null) p.setDescription(getDescription());
        if (getActive() != null) p.setActive(getActive());

        if (getProductIds() != null) p.setProducts(promotionService.findProducts(getProductIds()));
        if (getComboIds() != null) p.setCombos(promotionService.findCombos(getComboIds()));
        if (getValidDays() != null) p.setValidDays(getValidDays());
    }
}
