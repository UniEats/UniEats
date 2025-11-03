package ar.uba.fi.ingsoft1.product_example.Orders;

import ar.uba.fi.ingsoft1.product_example.OrderDetails.OrderDetail;
import ar.uba.fi.ingsoft1.product_example.OrderDetails.OrderDetailRepository;
import ar.uba.fi.ingsoft1.product_example.OrderDetails.OrderDetailCreateDTO;
import ar.uba.fi.ingsoft1.product_example.Products.Product;
import ar.uba.fi.ingsoft1.product_example.Combos.Combo;
import ar.uba.fi.ingsoft1.product_example.Products.ProductRepository;
import ar.uba.fi.ingsoft1.product_example.Combos.ComboRepository;
import ar.uba.fi.ingsoft1.product_example.Ingredients.IngredientRepository;

import jakarta.persistence.EntityNotFoundException;
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
    private final IngredientRepository ingredientRepository;

    private static final Long STATUS_CONFIRMED = 1L;
    private static final Long STATUS_IN_PREPARATION = 2L;
    private static final Long STATUS_READY = 3L;
    private static final Long STATUS_COMPLETE = 4L;
    private static final Long STATUS_CANCELED = 5L;

    public List<OrderDTO> geAlltOrders() {
        return orderRepository.findAll()
                .stream()
                .map(OrderDTO::new)
                .toList();
    }

    public List<OrderDTO> getConfirmedOrders() {
        return orderRepository.findAll()
                .stream()
                .filter(o -> o.getState() != null && STATUS_CONFIRMED.equals(o.getState().getId()))
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

        OrderStatus confirmedStatus = new OrderStatus(STATUS_CONFIRMED, "confirmed");
        order.setState(confirmedStatus);

    // Do not persist the order before adding details. Persist at the end so
    // CascadeType.PERSIST on the details relationship saves the children.

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
        order = orderRepository.save(order);
        return Optional.of(order.toDTO());
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

    private void discountIngredientsForProduct(Product product, int quantityOrdered) {
        if (product.getProductIngredients() == null) return;

        product.getProductIngredients().forEach(pi -> {
            var ingredient = pi.getIngredient();
            int required = pi.getQuantity() * quantityOrdered;

            int newStock = ingredient.getStock() - required;
            if (newStock < 0) {
                throw new IllegalStateException(
                        "Not enough stock for ingredient: " + ingredient.getName()
                );
            }

            ingredient.setStock(newStock);
            ingredientRepository.save(ingredient);
        });
    }

    @Transactional
    public Optional<OrderDTO> startPreparation(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Order not found"));

        if (!STATUS_CONFIRMED.equals(order.getState().getId())) {
            throw new IllegalStateException("Order must be confirmed to start preparation");
        }

        for (OrderDetail detail : order.getDetails()) {
            if (detail.getProduct() != null) {
                Product product = detail.getProduct();
                discountIngredientsForProduct(product, detail.getQuantity());
            } else if (detail.getCombo() != null) {
                Combo combo = detail.getCombo();
                for (var comboProduct : combo.getComboProducts()) {
                    Product product = comboProduct.getProduct();
                    int comboQuantity = comboProduct.getQuantity() * detail.getQuantity();
                    discountIngredientsForProduct(product, comboQuantity);
                }
            }
        }

        order.setState(entityManager.getReference(OrderStatus.class, STATUS_IN_PREPARATION));
        order.setState(new OrderStatus(STATUS_IN_PREPARATION, "in preparation"));
        return Optional.of(orderRepository.save(order).toDTO());
    }

    @Transactional
    public Optional<OrderDTO> confirmOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Order not found"));
        order.setState(new OrderStatus(STATUS_CONFIRMED, "confirmed"));
        return Optional.of(orderRepository.save(order).toDTO());
    }

    @Transactional
    public Optional<OrderDTO> markReady(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Order not found"));
        if (!STATUS_IN_PREPARATION.equals(order.getState().getId())) {
            throw new IllegalStateException("Order must be in preparation to mark ready");
        }
        order.setState(new OrderStatus(STATUS_READY, "ready for pickup"));
        return Optional.of(orderRepository.save(order).toDTO());
    }

    @Transactional
    public Optional<OrderDTO> pickup(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Order not found"));
        if (!STATUS_READY.equals(order.getState().getId())) {
            throw new IllegalStateException("Order must be ready for pickup");
        }
        order.setState(new OrderStatus(STATUS_COMPLETE, "complete"));
        return Optional.of(orderRepository.save(order).toDTO());
    }

    @Transactional
    public Optional<OrderDTO> cancelOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Order not found"));
        if (STATUS_IN_PREPARATION.equals(order.getState().getId()) ||
                STATUS_READY.equals(order.getState().getId()) ||
                STATUS_COMPLETE.equals(order.getState().getId())) {
            throw new IllegalStateException("Order cannot be canceled once preparation has started");
        }
        order.setState(new OrderStatus(STATUS_CANCELED, "canceled"));
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
