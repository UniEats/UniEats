package ar.uba.fi.ingsoft1.product_example.Orders;

import ar.uba.fi.ingsoft1.product_example.OrderDetails.OrderDetailDTO;
import ar.uba.fi.ingsoft1.product_example.OrderDetails.OrderDetail;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record OrderDTO(
        long id,
        Long userId,
        LocalDateTime creationDate,
        LocalDateTime estimatedDeliveryTime,
        BigDecimal totalPrice,
        long stateId,
        List<OrderDetailDTO> details
) {
    public OrderDTO(Order order) {
        this (
                order.getId(),
                order.getUser() != null ? order.getUser().getId() : null,
                order.getCreationDate(),
                order.getEstimatedDeliveryTime(),
                order.getTotalPrice(),
                order.getState().getId(),
                order.getDetails().stream()
                        .map(OrderDetail::toDTO)
                        .toList()
        );
    }
}