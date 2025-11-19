package ar.uba.fi.ingsoft1.product_example.Promotions;

import java.util.Set;
import java.time.DayOfWeek;

public class BuyGiveFreePromotionUpdateDTO extends PromotionUpdateDTO {

    private Set<Long> freeProductIds;
    private Set<Long> freeComboIds;

    private Boolean oneFreePerTrigger;

    public BuyGiveFreePromotionUpdateDTO(String name,
                                         String description,
                                         Boolean active,
                                         Set<Long> triggerProductIds,
                                         Set<Long> triggerComboIds,
                                         Set<Long> freeProductIds,
                                         Set<Long> freeComboIds,
                                         Boolean oneFreePerTrigger,
                                         Set<DayOfWeek> validDays) {
        super(name, description, active, triggerProductIds, triggerComboIds, validDays);
        this.freeProductIds = freeProductIds;
        this.freeComboIds = freeComboIds;
        this.oneFreePerTrigger = oneFreePerTrigger;
    }

    @Override
    public void applyTo(Promotion promotion, PromotionService promotionService) {
        if (!(promotion instanceof BuyGiveFreePromotion p)) {
            throw new IllegalArgumentException("Promotion must be BuyGiveFreePromotion");
        }

        if (getName() != null) p.setName(getName());
        if (getDescription() != null) p.setDescription(getDescription());
        if (getActive() != null) p.setActive(getActive());
        if (getValidDays() != null) p.setValidDays(getValidDays());

        if (getProductIds() != null) p.setProducts(promotionService.findProducts(getProductIds()));
        if (getComboIds() != null) p.setCombos(promotionService.findCombos(getComboIds()));

        if (getFreeProductIds() != null)
            p.setFreeProducts(promotionService.findProducts(getFreeProductIds()));

        if (getFreeComboIds() != null)
            p.setFreeCombos(promotionService.findCombos(getFreeComboIds()));

        if (getOneFreePerTrigger() != null)
            p.setOneFreePerTrigger(getOneFreePerTrigger());
    }

    public Set<Long> getFreeProductIds() {
        return freeProductIds;
    }
    public Set<Long> getFreeComboIds() {
        return freeComboIds;
    }
    public Boolean getOneFreePerTrigger() {
        return oneFreePerTrigger;
    }
}
