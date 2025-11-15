package ar.uba.fi.ingsoft1.product_example.Promotions;

import ar.uba.fi.ingsoft1.product_example.Products.ProductDTO;
import ar.uba.fi.ingsoft1.product_example.Combos.ComboDTO;
import java.math.BigDecimal;
import java.util.Set;
import java.time.DayOfWeek;

public class ThresholdPromotionDTO extends PromotionDTO {
    private BigDecimal threshold;
    private BigDecimal discountAmount;

    public ThresholdPromotionDTO(Long id, String name, String description, boolean active,
                                 Set<ProductDTO> products, Set<ComboDTO> combos,
                                 BigDecimal threshold, BigDecimal discountAmount,
                                 Set<DayOfWeek> validDays) {
        super(id, name, description, active, "THRESHOLD", products, combos, validDays);
        this.threshold = threshold;
        this.discountAmount = discountAmount;
    }

    public BigDecimal getThreshold() { return threshold; }
    public BigDecimal getDiscountAmount() { return discountAmount; }
}
