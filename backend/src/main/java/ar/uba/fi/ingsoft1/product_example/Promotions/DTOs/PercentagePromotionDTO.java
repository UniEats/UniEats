package ar.uba.fi.ingsoft1.product_example.Promotions;

import ar.uba.fi.ingsoft1.product_example.Products.ProductDTO;
import ar.uba.fi.ingsoft1.product_example.Combos.ComboDTO;
import java.util.List;
import java.math.BigDecimal;
import java.util.Set;
import java.time.DayOfWeek;

public class PercentagePromotionDTO extends PromotionDTO {
    private BigDecimal percentage;

    public PercentagePromotionDTO(Long id, String name, String description, boolean active,
                                  Set<ProductDTO> products, Set<ComboDTO> combos, BigDecimal percentage,
                                  Set<DayOfWeek> validDays) {
        super(id, name, description, active, "PERCENTAGE", products, combos, validDays);
        this.percentage = percentage;
    }

    public BigDecimal getPercentage() { return percentage; }
}
