package ar.uba.fi.ingsoft1.product_example.OrderDetails;

import java.math.BigDecimal;

public record OrderDetailUpdateDTO(
        Integer quantity,
        BigDecimal price,
        BigDecimal discount
) {}
