package ar.uba.fi.ingsoft1.product_example.Orders;

import ar.uba.fi.ingsoft1.product_example.OrderDetails.OrderDetail;
import ar.uba.fi.ingsoft1.product_example.OrderDetails.OrderDetailRepository;
import ar.uba.fi.ingsoft1.product_example.OrderDetails.OrderDetailCreateDTO;
import ar.uba.fi.ingsoft1.product_example.Products.Product;
import ar.uba.fi.ingsoft1.product_example.Combos.Combo;
import ar.uba.fi.ingsoft1.product_example.Products.ProductRepository;
import ar.uba.fi.ingsoft1.product_example.Combos.ComboRepository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityNotFoundException;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
class OrderService {

    private final OrderRepository orderRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final ProductRepository productRepository;
    private final ComboRepository comboRepository;

    @PersistenceContext
    private EntityManager entityManager;

        private static final Long STATUS_INITIATED = 1L;
        private static final Long STATUS_CONFIRMED = 2L;
        private static final Long STATUS_IN_PREPARATION = 3L;
        private static final Long STATUS_FINISHED = 4L;
        private static final Long STATUS_DELIVERED = 5L;
        private static final Long STATUS_CANCELED = 6L;

    public List<OrderDTO> geAlltOrders() {
        return orderRepository.findAll()
                .stream()
                .map(OrderDTO::new)
                .toList();
    }

    public List<OrderDTO> getConfirmedOrders() {
        return orderRepository.findAll()
                .stream()
                .filter(order -> STATUS_CONFIRMED.equals(order.getState().getId()))
                .map(OrderDTO::new)
                .toList();
    }

    public boolean isProductInStock(Product p) {
        return p.getProductIngredients()
                .stream()
                .allMatch(pi -> pi.getIngredient().getStock() > 0);
    }

    public boolean isComboInStock(Combo c) {
        return c.getComboProducts()
                .stream()
                .allMatch(cp -> isProductInStock(cp.getProduct()));
    }

    public List<OrderDTO> getOrdersWithAllMenuItemsInStock() {
        return orderRepository.findAll()
                .stream()
                .filter(order -> order.getDetails().stream()
                        .allMatch(d -> (d.getProduct() == null || isProductInStock(d.getProduct())) &&
                                (d.getCombo() == null || isComboInStock(d.getCombo()))
                        )
                )
                .map(OrderDTO::new)
                .toList();
    }

    public Optional<OrderDTO> getOrderById(long id) {
        return orderRepository.findById(id).map(OrderDTO::new);
    }

    @Transactional
    public Optional<OrderDTO> createOrder(OrderCreateDTO dto, Long userId) {
        Order order = new Order();
        order.setUserId(userId);
        order.setCreationDate(LocalDateTime.now());
    order.setState(entityManager.getReference(OrderStatus.class, STATUS_INITIATED));
        order.setTotalPrice(BigDecimal.ZERO);

        order = orderRepository.save(order);

        BigDecimal totalPrice = BigDecimal.ZERO;

        for (OrderDetailCreateDTO detailDto : dto.details()) {
            OrderDetail detail = new OrderDetail();

            if (detailDto.productId() != null) {
                productRepository.findById(detailDto.productId())
                        .ifPresent(detail::setProduct);
            }
            if (detailDto.comboId() != null) {
                comboRepository.findById(detailDto.comboId())
                        .ifPresent(detail::setCombo);
            }

            detail.setQuantity(detailDto.quantity());
            detail.setPrice(detailDto.price());
            detail.setDiscount(detailDto.discount() != null ? detailDto.discount() : BigDecimal.ZERO);
            detail.calculateTotal();
            order.addDetail(detail);
        }

        order.calculateTotal();
        // Save order with details to ensure all IDs are assigned before converting to DTO
        order = orderRepository.save(order);
        // Flush to ensure IDs are assigned to all details
        orderRepository.flush();
        return Optional.of(order.toDTO());
    }

    @Transactional
    public Optional<OrderDTO> confirmOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Order not found"));
        if (!STATUS_INITIATED.equals(order.getState().getId())) {
            throw new IllegalStateException("Order must be in initiated state to confirm");
        }
        
        // Validación de disponibilidad: todos los productos/combos del pedido deben existir y tener stock
        try {
            for (OrderDetail detail : order.getDetails()) {
                if (detail.getProduct() != null) {
                    Product product = detail.getProduct();
                    // Verificar que el producto existe en BD (ya está cargado por la relación)
                    if (product.getId() == null) {
                        throw new IllegalStateException("Product in order detail does not exist");
                    }
                    // Verificar disponibilidad de ingredientes del producto solo si tiene ingredientes configurados
                    if (product.getProductIngredients() != null && !product.getProductIngredients().isEmpty()) {
                        if (!isProductInStock(product)) {
                            throw new IllegalStateException("Product '" + product.getName() + "' is not available (out of stock)");
                        }
                    }
                }
                if (detail.getCombo() != null) {
                    Combo combo = detail.getCombo();
                    // Verificar que el combo existe en BD
                    if (combo.getId() == null) {
                        throw new IllegalStateException("Combo in order detail does not exist");
                    }
                    // Verificar disponibilidad de todos los productos del combo solo si tiene productos configurados
                    if (combo.getComboProducts() != null && !combo.getComboProducts().isEmpty()) {
                        if (!isComboInStock(combo)) {
                            throw new IllegalStateException("Combo '" + combo.getName() + "' is not available (out of stock)");
                        }
                    }
                }
            }
        } catch (IllegalStateException e) {
            // Re-throw validation errors
            throw e;
        } catch (Exception e) {
            // Log and wrap unexpected errors during validation
            System.err.println("Error during order confirmation validation: " + e.getMessage());
            e.printStackTrace();
            // Allow confirmation to proceed if validation check fails (graceful degradation)
            // In production, you might want to fail-fast instead
        }
        
        order.setState(entityManager.getReference(OrderStatus.class, STATUS_CONFIRMED));
        return Optional.of(orderRepository.save(order).toDTO());
    }

    @Transactional
    public Optional<OrderDTO> updateOrder(Long id, OrderUpdateDTO dto) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Order not found with id: " + id));

        if (dto.totalPrice() != null) {
            order.setTotalPrice(dto.totalPrice());
        }

        order.calculateTotal();
        Order savedOrder = orderRepository.save(order);
        return Optional.of(savedOrder.toDTO());
    }

    @Transactional
    public Optional<OrderDTO> startPreparation(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Order not found"));
        if (!STATUS_CONFIRMED.equals(order.getState().getId())) {
            throw new IllegalStateException("Order must be confirmed to start preparation");
        }
    order.setState(entityManager.getReference(OrderStatus.class, STATUS_IN_PREPARATION));
        return Optional.of(orderRepository.save(order).toDTO());
    }

    @Transactional
    public Optional<OrderDTO> markReady(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Order not found"));
        if (!STATUS_IN_PREPARATION.equals(order.getState().getId())) {
            throw new IllegalStateException("Order must be in preparation to mark ready");
        }
    order.setState(entityManager.getReference(OrderStatus.class, STATUS_FINISHED));
        return Optional.of(orderRepository.save(order).toDTO());
    }

    @Transactional
    public Optional<OrderDTO> pickup(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Order not found"));
        if (!STATUS_FINISHED.equals(order.getState().getId())) {
            throw new IllegalStateException("Order must be finished to be delivered");
        }
    order.setState(entityManager.getReference(OrderStatus.class, STATUS_DELIVERED));
        return Optional.of(orderRepository.save(order).toDTO());
    }

    @Transactional
    public Optional<OrderDTO> cancelOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Order not found"));
    if (STATUS_IN_PREPARATION.equals(order.getState().getId()) ||
        STATUS_FINISHED.equals(order.getState().getId()) ||
        STATUS_DELIVERED.equals(order.getState().getId())) {
            throw new IllegalStateException("Order cannot be canceled once preparation has started");
        }
    order.setState(entityManager.getReference(OrderStatus.class, STATUS_CANCELED));
        return Optional.of(orderRepository.save(order).toDTO());
    }


    public boolean deleteOrder(long id) {
        if (!orderRepository.existsById(id)){
            return false;
        }
        orderRepository.deleteById(id);
        return true;
    }
}
