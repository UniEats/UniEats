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
) {
    public OrderDetailDTO(OrderDetail orderDetail) {
        this(
                orderDetail.getId(),
                orderDetail.getOrder().getId(),
                orderDetail.getProductId(),
                orderDetail.getComboId(),
                orderDetail.getQuantity(),
                orderDetail.getPrice(),
                orderDetail.getDiscount(),
                orderDetail.getTotalPrice()
        );
    }
}