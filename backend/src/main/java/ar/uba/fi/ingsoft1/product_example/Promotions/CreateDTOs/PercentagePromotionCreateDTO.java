package ar.uba.fi.ingsoft1.product_example.Promotions;

import java.math.BigDecimal;
import java.util.Set;
import java.time.DayOfWeek;

public class PercentagePromotionCreateDTO extends PromotionCreateDTO {
    private BigDecimal percentage;

    public PercentagePromotionCreateDTO(String name, String description, boolean active,
                                        Set<Long> productIds, Set<Long> comboIds,
                                        BigDecimal percentage, Set<DayOfWeek> validDays) {
        super(name, description, active, productIds, comboIds, validDays);
        this.percentage = percentage;
    }

    public BigDecimal getPercentage() { return percentage; }

    @Override
    public Promotion toEntity(PromotionService promotionService) {
        PercentageDiscountPromotion promo = new PercentageDiscountPromotion();
        promo.setName(getName());
        promo.setDescription(getDescription());
        promo.setActive(isActive());
        promo.setPercentage(percentage);
        promo.setProducts(promotionService.findProducts(getProductIds()));
        promo.setCombos(promotionService.findCombos(getComboIds()));
        promo.setValidDays(getValidDays());
        return promo;
    }
}
