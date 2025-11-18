package ar.uba.fi.ingsoft1.product_example.Promotions;

import ar.uba.fi.ingsoft1.product_example.Products.ProductDTO;
import ar.uba.fi.ingsoft1.product_example.Combos.ComboDTO;
import java.util.Set;
import java.time.DayOfWeek;

public class BuyGiveFreePromotionDTO extends PromotionDTO {

    private Set<ProductDTO> freeProducts;
    private Set<ComboDTO> freeCombos;

    private boolean oneFreePerTrigger;

    public BuyGiveFreePromotionDTO(
            Long id, String name, String description, boolean active,
            Set<ProductDTO> triggerProducts,
            Set<ComboDTO> triggerCombos,
            Set<ProductDTO> freeProducts,
            Set<ComboDTO> freeCombos,
            Set<DayOfWeek> validDays,
            boolean oneFreePerTrigger
    ) {
        super(id, name, description, active, "BUY_GIVE_FREE",
              triggerProducts, triggerCombos, validDays);

        this.freeProducts = freeProducts;
        this.freeCombos = freeCombos;
        this.oneFreePerTrigger = oneFreePerTrigger;
    }

    public Set<ProductDTO> getFreeProducts() {
        return freeProducts;
    }
    public Set<ComboDTO> getFreeCombos() {
        return freeCombos;
    }
    public boolean isOneFreePerTrigger() {
        return oneFreePerTrigger;
    }
}
