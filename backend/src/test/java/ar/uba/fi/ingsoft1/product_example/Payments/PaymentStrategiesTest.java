package ar.uba.fi.ingsoft1.product_example.Payments;

import ar.uba.fi.ingsoft1.product_example.Orders.OrderDTO;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class PaymentStrategiesTest {

    @Test
    void cashPayment_ReturnsCorrectSuccessMessage() {
        CashPayment strategy = new CashPayment();
        OrderDTO mockOrder = Mockito.mock(OrderDTO.class);

        PaymentResult result = strategy.processPayment(mockOrder);

        assertTrue(result.isSuccess(), "Cash payment should be successful");
        assertEquals("Pago grabado como efectivo", result.getMessage());
    }

    @Test
    void creditCardPayment_ReturnsCorrectSuccessMessage() {
        CreditCardPayment strategy = new CreditCardPayment();
        OrderDTO mockOrder = Mockito.mock(OrderDTO.class);

        PaymentResult result = strategy.processPayment(mockOrder);

        assertTrue(result.isSuccess(), "Credit Card payment should be successful");
        assertEquals("Pago simulado con tarjeta", result.getMessage());
    }

    @Test
    void qrPayment_ReturnsCorrectSuccessMessage() {
        QRPayment strategy = new QRPayment();
        OrderDTO mockOrder = Mockito.mock(OrderDTO.class);

        PaymentResult result = strategy.processPayment(mockOrder);

        assertTrue(result.isSuccess(), "QR payment should be successful");
        assertEquals("Pago QR simulado", result.getMessage());
    }
}
