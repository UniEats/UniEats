package ar.uba.fi.ingsoft1.product_example.Payments;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class PaymentMethodFactoryTest {

    @Mock
    private CreditCardPayment creditCardPayment;

    @Mock
    private CashPayment cashPayment;

    @Mock
    private QRPayment qrPayment;

    @InjectMocks
    private PaymentMethodFactory paymentMethodFactory;

    @Test
    void testGet_CreditCard() {
        PaymentMethod method = paymentMethodFactory.get("credit");
        assertSame(creditCardPayment, method);
    }

    @Test
    void testGet_Cash() {
        PaymentMethod method = paymentMethodFactory.get("cash");
        assertSame(cashPayment, method);
    }

    @Test
    void testGet_QR() {
        PaymentMethod method = paymentMethodFactory.get("qr");
        assertSame(qrPayment, method);
    }

    @Test
    void testGet_InvalidMethod_ThrowsException() {
        Exception exception = assertThrows(
            IllegalArgumentException.class,
            () -> {
                paymentMethodFactory.get("invalid_method");
            }
        );

        assertTrue(
            exception.getMessage().contains("Unsupported payment method")
        );
    }
}
