package ar.uba.fi.ingsoft1.product_example.OrderDetails;

import lombok.NonNull;
import java.math.BigDecimal;

public record OrderDetailCreateDTO(
        Long productId,
        Long comboId,
        @NonNull Integer quantity,
        @NonNull BigDecimal price,
        BigDecimal discount
) {}
