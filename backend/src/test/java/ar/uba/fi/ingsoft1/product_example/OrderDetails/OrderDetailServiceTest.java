package ar.uba.fi.ingsoft1.product_example.OrderDetails;

import ar.uba.fi.ingsoft1.product_example.Orders.*;
import ar.uba.fi.ingsoft1.product_example.Products.Product;
import ar.uba.fi.ingsoft1.product_example.Products.ProductRepository;
import ar.uba.fi.ingsoft1.product_example.Combos.Combo;
import ar.uba.fi.ingsoft1.product_example.Combos.ComboRepository;
import ar.uba.fi.ingsoft1.product_example.user.User;
import jakarta.persistence.EntityNotFoundException;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class OrderDetailServiceTest {

    @Mock
    private OrderDetailRepository orderDetailRepository;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private ComboRepository comboRepository;

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private OrderDetailService orderDetailService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    private Order createOrder() {
        Order order = new Order();
        order.setId(1L);

        User user = new User();
        user.setId(1L);
        order.setUser(user);

        order.setCreationDate(LocalDateTime.now());
        order.setState(new OrderStatus(1L, "confirmed"));
        return order;
    }

    private OrderDetail createDetail(Order order) {
        OrderDetail detail = new OrderDetail(
                2,
                new BigDecimal("100.00"),
                BigDecimal.ZERO,
                new BigDecimal("200.00")
        );
        detail.setId(1L);
        detail.setOrder(order);
        return detail;
    }

    @Test
    void testGetDetailsByOrderId_returnsList() {
        Order order = createOrder();
        OrderDetail detail = createDetail(order);

        when(orderDetailRepository.findByOrderId(1L)).thenReturn(List.of(detail));

        List<OrderDetailDTO> result = orderDetailService.getDetailsByOrderId(1L);

        assertEquals(1, result.size());
        assertEquals(1L, result.get(0).id());
    }

    @Test
    void testUpdateOrderDetail_success() {
        Order order = createOrder();
        OrderDetail detail = createDetail(order);

        OrderDetailUpdateDTO dto = new OrderDetailUpdateDTO(
                3,
                new BigDecimal("120.00"),
                BigDecimal.ZERO
        );

        when(orderDetailRepository.findById(1L)).thenReturn(Optional.of(detail));
        when(orderDetailRepository.save(detail)).thenReturn(detail);

        Optional<OrderDetailDTO> result =
                orderDetailService.updateOrderDetail(1L, dto);

        assertTrue(result.isPresent());
        assertEquals(3, detail.getQuantity());
        assertEquals(new BigDecimal("360.00"), detail.getTotalPrice());
        verify(orderDetailRepository).save(detail);
    }

    @Test
    void testUpdateOrderDetail_notFound_throws() {
        OrderDetailUpdateDTO dto = new OrderDetailUpdateDTO(
                2,
                new BigDecimal("150.00"),
                BigDecimal.ZERO
        );

        when(orderDetailRepository.findById(5L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class,
                () -> orderDetailService.updateOrderDetail(5L, dto));
    }

    @Test
    void testDeleteOrderDetail_success() {
        when(orderDetailRepository.existsById(1L)).thenReturn(true);

        boolean result = orderDetailService.deleteOrderDetail(1L);

        assertTrue(result);
        verify(orderDetailRepository).deleteById(1L);
    }

    @Test
    void testDeleteOrderDetail_notFound() {
        when(orderDetailRepository.existsById(9L)).thenReturn(false);

        boolean result = orderDetailService.deleteOrderDetail(9L);

        assertFalse(result);
        verify(orderDetailRepository, never()).deleteById(anyLong());
    }
}
