package ar.uba.fi.ingsoft1.product_example.Orders;

import ar.uba.fi.ingsoft1.product_example.OrderDetails.*;
import ar.uba.fi.ingsoft1.product_example.Products.Product;
import ar.uba.fi.ingsoft1.product_example.Combos.Combo;
import ar.uba.fi.ingsoft1.product_example.Ingredients.Ingredient;
import ar.uba.fi.ingsoft1.product_example.Ingredients.IngredientRepository;
import ar.uba.fi.ingsoft1.product_example.Products.ProductRepository;
import ar.uba.fi.ingsoft1.product_example.Combos.ComboRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private OrderDetailRepository orderDetailRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private ComboRepository comboRepository;

    @Mock
    private IngredientRepository ingredientRepository;

    @InjectMocks
    private OrderService orderService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    private Order createValidOrder() {
        Order order = new Order();
        order.setId(1L);
        order.setUserId(1L);
        order.setCreationDate(LocalDateTime.now());
        order.setState(new OrderStatus(1L, "confirmed"));
        return order;
    }

    @Test
    void testGetOrderById_Found() {
        Order order = createValidOrder();
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        Optional<OrderDTO> result = orderService.getOrderById(1L);

        assertTrue(result.isPresent());
        assertEquals(1L, result.get().id());
    }

    @Test
    void testGetOrderById_NotFound() {
        when(orderRepository.findById(1L)).thenReturn(Optional.empty());

        Optional<OrderDTO> result = orderService.getOrderById(1L);

        assertTrue(result.isEmpty());
    }

    @Test
    void testCreateOrder_Success() {
        OrderCreateDTO dto = new OrderCreateDTO(
                List.of(new OrderDetailCreateDTO(
                        1L, null, 1, new BigDecimal("500.00"), null))
        );

        Product product = new Product("P1", "Desc", new BigDecimal("500.00"));
        product.setId(1L);

        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> {
            Order saved = inv.getArgument(0);
            saved.setId(10L);
            saved.setUserId(1L);

            saved.getDetails().forEach(d -> {
                d.setId(1L);
                d.setOrder(saved);
            });

            return saved;
        });
    }

    @Test
    void testUpdateOrder_Success() {
        Order order = createValidOrder();
        OrderUpdateDTO dto = new OrderUpdateDTO(new BigDecimal("800.00"));

        OrderDetail detail = new OrderDetail(
        1, new BigDecimal("100.00"),
                BigDecimal.ZERO, BigDecimal.ZERO
        );
        detail.setId(1L);
        detail.setOrder(order);
        detail.calculateTotal();
        
        order.setDetails(List.of(detail));

        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenReturn(order);

        Optional<OrderDTO> result = orderService.updateOrder(1L, dto);

        assertTrue(result.isPresent());
        assertEquals(new BigDecimal("100.00"), order.getTotalPrice());
        verify(orderRepository).save(order);
    }

    @Test
    void testUpdateOrder_NotFound_Throws() {
        when(orderRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(Exception.class, () -> orderService.updateOrder(99L, new OrderUpdateDTO(null)));
    }

    @Test
    void testStartPreparation_Success() {
        Order order = createValidOrder();

        Product product = new Product("P1", "Desc", new BigDecimal("100.00"));
        product.setProductIngredients(List.of()); 

        OrderDetail detail = new OrderDetail(
        1, new BigDecimal("100.00"),
        BigDecimal.ZERO, BigDecimal.ZERO
        );
        detail.calculateTotal();

        detail.setId(1L);
        detail.setOrder(order);
        detail.setProduct(product);

        order.setDetails(List.of(detail));

        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenReturn(order);

        Optional<OrderDTO> result = orderService.startPreparation(1L);

        assertTrue(result.isPresent());
        assertEquals(2L, order.getState().getId()); 
    }

    @Test
    void testStartPreparation_NotFound() {
        when(orderRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(Exception.class, () -> orderService.startPreparation(1L));
    }

    @Test
    void testConfirmOrder_Success() {
        Order order = createValidOrder();
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenReturn(order);

        Optional<OrderDTO> result = orderService.confirmOrder(1L);

        assertTrue(result.isPresent());
        assertEquals(1L, order.getState().getId()); 
    }

    @Test
    void testMarkReady_Success() {
        Order order = createValidOrder();
        order.setState(new OrderStatus(2L, "in preparation"));

        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenReturn(order);

        Optional<OrderDTO> result = orderService.markReady(1L);

        assertTrue(result.isPresent());
        assertEquals(3L, order.getState().getId());
    }

    @Test
    void testPickup_Success() {
        Order order = new Order();
        order.setId(1L);
        order.setState(new OrderStatus(3L, "ready"));
        order.setUserId(1L);
        
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(orderRepository.save(order)).thenReturn(order);

        Optional<OrderDTO> result = orderService.pickup(1L);

        assertTrue(result.isPresent());
        assertEquals(4L, order.getState().getId()); 
    }

    @Test
    void testCancelOrder_Success() {
        Order order = createValidOrder();
        order.setState(new OrderStatus(1L, "confirmed"));

        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(orderRepository.save(order)).thenReturn(order);

        Optional<OrderDTO> result = orderService.cancelOrder(1L);

        assertTrue(result.isPresent());
        assertEquals(5L, order.getState().getId()); 
    }

    @Test
    void testDeleteOrder_Found() {
        when(orderRepository.existsById(1L)).thenReturn(true);

        boolean deleted = orderService.deleteOrder(1L);

        assertTrue(deleted);
        verify(orderRepository).deleteById(1L);
    }

    @Test
    void testDeleteOrder_NotFound() {
        when(orderRepository.existsById(1L)).thenReturn(false);

        boolean deleted = orderService.deleteOrder(1L);

        assertFalse(deleted);
    }
}
