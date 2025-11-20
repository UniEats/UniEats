package ar.uba.fi.ingsoft1.product_example.Payments;

import ar.uba.fi.ingsoft1.product_example.Orders.OrderDTO;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class PaymentStrategiesTest {

    @Test
    void cashPayment_ReturnsCorrectSuccessMessage() {
        OrderDTO realOrder = new OrderDTO(
                1L,
                2L,
                LocalDateTime.now(),
                LocalDateTime.now().plusHours(2),
                new BigDecimal("100.00"),
                1L,
                List.of()
        );

        CashPayment strategy = new CashPayment();
        PaymentResult result = strategy.processPayment(realOrder);

        assertTrue(result.isSuccess(), "Cash payment should be successful");
        assertEquals("Pago grabado como efectivo", result.getMessage());
    }

    @Test
    void creditCardPayment_ReturnsCorrectSuccessMessage() {
        // Crear una instancia real de OrderDTO con datos de prueba
        OrderDTO realOrder = new OrderDTO(
                1L,
                2L,
                LocalDateTime.now(),
                LocalDateTime.now().plusHours(2),
                new BigDecimal("200.00"),
                1L,
                List.of()
        );

        CreditCardPayment strategy = new CreditCardPayment();

        PaymentResult result = strategy.processPayment(realOrder);

        assertTrue(result.isSuccess(), "Credit Card payment should be successful");
        assertEquals("Pago simulado con tarjeta", result.getMessage());
    }

    @Test
    void qrPayment_ReturnsCorrectSuccessMessage() {
        OrderDTO realOrder = new OrderDTO(
                1L,
                2L,
                LocalDateTime.now(),
                LocalDateTime.now().plusHours(2),
                new BigDecimal("150.00"),
                1L,
                List.of()
        );

        QRPayment strategy = new QRPayment();

        PaymentResult result = strategy.processPayment(realOrder);

        assertTrue(result.isSuccess(), "QR payment should be successful");
        assertEquals("Pago QR simulado", result.getMessage());
    }
}
