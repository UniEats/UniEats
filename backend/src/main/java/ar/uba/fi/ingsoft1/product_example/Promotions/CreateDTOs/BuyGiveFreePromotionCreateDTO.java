package ar.uba.fi.ingsoft1.product_example.Promotions;

import java.util.Set;
import java.time.DayOfWeek;

public class BuyGiveFreePromotionCreateDTO extends PromotionCreateDTO {

    private Set<Long> freeProductIds;
    private Set<Long> freeComboIds;

    private boolean oneFreePerTrigger;

    public BuyGiveFreePromotionCreateDTO(String name, String description, boolean active,
                                         Set<Long> triggerProductIds, Set<Long> triggerComboIds,
                                         Set<Long> freeProductIds, Set<Long> freeComboIds,
                                         boolean oneFreePerTrigger,
                                         Set<DayOfWeek> validDays) {
        super(name, description, active, triggerProductIds, triggerComboIds, validDays);
        this.freeProductIds = freeProductIds;
        this.freeComboIds = freeComboIds;
        this.oneFreePerTrigger = oneFreePerTrigger;
    }

    @Override
    public Promotion toEntity(PromotionService promotionService) {
        BuyGiveFreePromotion promo = new BuyGiveFreePromotion();
        promo.setName(getName());
        promo.setDescription(getDescription());
        promo.setActive(isActive());
        promo.setValidDays(getValidDays());

        promo.setProducts(promotionService.findProducts(getProductIds()));
        promo.setCombos(promotionService.findCombos(getComboIds()));

        if (freeProductIds != null)
            promo.setFreeProducts(promotionService.findProducts(freeProductIds));

        if (freeComboIds != null)
            promo.setFreeCombos(promotionService.findCombos(freeComboIds));

        promo.setOneFreePerTrigger(oneFreePerTrigger);

        return promo;
    }
}
