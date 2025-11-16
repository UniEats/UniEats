package ar.uba.fi.ingsoft1.product_example.OrderDetails;

import java.math.BigDecimal;

public record OrderDetailDTO(
        long id,
        long orderId,
        Long productId,
        Long comboId,
        Integer quantity,
        BigDecimal price,
        BigDecimal discount,
        BigDecimal totalPrice
) {}