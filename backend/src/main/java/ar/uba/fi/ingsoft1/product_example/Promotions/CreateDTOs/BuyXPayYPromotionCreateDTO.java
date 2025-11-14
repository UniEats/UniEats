package ar.uba.fi.ingsoft1.product_example.Promotions;

import java.util.List;
import java.util.Set;
import java.time.DayOfWeek;

public class BuyXPayYPromotionCreateDTO extends PromotionCreateDTO {
    private int buyQuantity;
    private int payQuantity;

    public BuyXPayYPromotionCreateDTO(String name, String description, boolean active,
                                      Set<Long> productIds, Set<Long> comboIds,
                                      int buyQuantity, int payQuantity, Set<DayOfWeek> validDays) {
        super(name, description, active, productIds, comboIds, validDays);
        this.buyQuantity = buyQuantity;
        this.payQuantity = payQuantity;
    }

    public int getBuyQuantity() { return buyQuantity; }
    public int getPayQuantity() { return payQuantity; }


    @Override
    public Promotion toEntity(PromotionService promotionService) {
        BuyXPayYPromotion promo = new BuyXPayYPromotion();
        promo.setName(getName());
        promo.setDescription(getDescription());
        promo.setActive(isActive());
        promo.setBuyQuantity(buyQuantity);
        promo.setPayQuantity(payQuantity);
        promo.setProducts(promotionService.findProducts(getProductIds()));
        promo.setCombos(promotionService.findCombos(getComboIds()));
        promo.setValidDays(getValidDays());
        return promo;
    }
}
