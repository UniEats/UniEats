package ar.uba.fi.ingsoft1.product_example.Promotions;

import ar.uba.fi.ingsoft1.product_example.Products.ProductDTO;
import ar.uba.fi.ingsoft1.product_example.Combos.ComboDTO;
import java.util.Set;
import java.time.DayOfWeek;

public class BuyXPayYPromotionDTO extends PromotionDTO {
    private int buyQuantity;
    private int payQuantity;

    public BuyXPayYPromotionDTO(Long id, String name, String description, boolean active,
                                Set<ProductDTO> products, Set<ComboDTO> combos,
                                int buyQuantity, int payQuantity, Set<DayOfWeek> validDays) {
        super(id, name, description, active, "BUYX_PAYY", products, combos, validDays);
        this.buyQuantity = buyQuantity;
        this.payQuantity = payQuantity;
    }

    public int getBuyQuantity() { return buyQuantity; }
    public int getPayQuantity() { return payQuantity; }
}
