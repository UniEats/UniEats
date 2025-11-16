package ar.uba.fi.ingsoft1.product_example.Payments;

import static org.hamcrest.Matchers.is;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import ar.uba.fi.ingsoft1.product_example.Orders.OrderDTO;
import ar.uba.fi.ingsoft1.product_example.Orders.OrderService;
import ar.uba.fi.ingsoft1.product_example.config.security.JwtService;
import ar.uba.fi.ingsoft1.product_example.config.security.SecurityConfig;
import ar.uba.fi.ingsoft1.product_example.user.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(PaymentRestController.class)
@Import(SecurityConfig.class)
class PaymentRestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private OrderService orderService;

    @MockBean
    private PaymentMethodFactory paymentMethodFactory;

    // Mock dependencies required by SecurityConfig
    @MockBean
    private JwtService jwtService;

    @MockBean
    private UserRepository userRepository;

    private OrderDTO testOrder;

    @BeforeEach
    void setUp() {
        testOrder = new OrderDTO(
            1L,
            1L,
            LocalDateTime.now(),
            null,
            new BigDecimal("100.00"),
            1L,
            List.of()
        );
    }

    @Test
    void testPay_Success() throws Exception {
        when(orderService.getOrderById(1L)).thenReturn(Optional.of(testOrder));
        when(paymentMethodFactory.get("cash")).thenReturn(new CashPayment());

        mockMvc
            .perform(post("/payments/1?method=cash"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success", is(true)))
            .andExpect(jsonPath("$.message", is("Pago grabado como efectivo")));
    }

    @Test
    void testPay_OrderNotFound() throws Exception {
        when(orderService.getOrderById(999L)).thenThrow(
            new EntityNotFoundException("Order not found with id: 999")
        );

        mockMvc
            .perform(post("/payments/999?method=cash"))
            .andExpect(status().isNotFound());
    }

    @Test
    void testPay_InvalidMethod() throws Exception {
        when(orderService.getOrderById(1L)).thenReturn(Optional.of(testOrder));
        when(paymentMethodFactory.get("bitcoin")).thenThrow(
            new IllegalArgumentException("Unsupported payment method: bitcoin")
        );

        mockMvc
            .perform(post("/payments/1?method=bitcoin"))
            .andExpect(status().isBadRequest())
            .andExpect(content().string("Unsupported payment method: bitcoin"));
    }
}
