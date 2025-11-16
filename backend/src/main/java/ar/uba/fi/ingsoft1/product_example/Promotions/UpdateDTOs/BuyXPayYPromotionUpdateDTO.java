package ar.uba.fi.ingsoft1.product_example.Promotions;

import java.util.Set;
import java.time.DayOfWeek;

public class BuyXPayYPromotionUpdateDTO extends PromotionUpdateDTO {
    private Integer buyQuantity;
    private Integer payQuantity;

    public BuyXPayYPromotionUpdateDTO(String name, String description, Boolean active,
                                      Set<Long> productIds, Set<Long> comboIds,
                                      Integer buyQuantity, Integer payQuantity,
                                      Set<DayOfWeek> validDays) {
        super(name, description, active, productIds, comboIds, validDays);
        this.buyQuantity = buyQuantity;
        this.payQuantity = payQuantity;
    }

    public Integer getBuyQuantity() { return buyQuantity; }
    public Integer getPayQuantity() { return payQuantity; }

    @Override
    public void applyTo(Promotion promotion, PromotionService promotionService) {
        if (!(promotion instanceof BuyXPayYPromotion p)) {
            throw new IllegalArgumentException("Promotion must be BuyXPayYPromotion");
        }

        if (buyQuantity != null) p.setBuyQuantity(buyQuantity);
        if (payQuantity != null) p.setPayQuantity(payQuantity);
        if (getName() != null) p.setName(getName());
        if (getDescription() != null) p.setDescription(getDescription());
        if (getActive() != null) p.setActive(getActive());

        if (getProductIds() != null) p.setProducts(promotionService.findProducts(getProductIds()));
        if (getComboIds() != null) p.setCombos(promotionService.findCombos(getComboIds()));
        if (getValidDays() != null) p.setValidDays(getValidDays());
    }
}
