package ar.uba.fi.ingsoft1.product_example.OrderDetails;

import ar.uba.fi.ingsoft1.product_example.Orders.Order;
import ar.uba.fi.ingsoft1.product_example.Orders.OrderRepository;
import ar.uba.fi.ingsoft1.product_example.Products.ProductRepository;
import ar.uba.fi.ingsoft1.product_example.Combos.ComboRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
public class OrderDetailService {

    private final OrderDetailRepository orderDetailRepository;
    private final OrderRepository orderRepository;
    private final ComboRepository comboRepository;
    private final ProductRepository productRepository;

    public List<OrderDetailDTO> getDetailsByOrderId(Long orderId) {
        return orderDetailRepository.findByOrderId(orderId)
                .stream()
                .map(OrderDetail::toDTO)
                .toList();
    }

    public Optional<OrderDetailDTO> updateOrderDetail(Long id, OrderDetailUpdateDTO dto) {
        OrderDetail detail = orderDetailRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Order detail not found with id: " + id));

        if (dto.quantity() != null) detail.setQuantity(dto.quantity());
        if (dto.price() != null) detail.setPrice(dto.price());
        if (dto.discount() != null) detail.setDiscount(dto.discount());

        detail.calculateTotal();
        return Optional.of(orderDetailRepository.save(detail).toDTO());
    }

    public boolean deleteOrderDetail(Long id) {
        if (!orderDetailRepository.existsById(id)) return false;
        orderDetailRepository.deleteById(id);
        return true;
    }
}
