package ar.uba.fi.ingsoft1.product_example.Payments;

import static org.junit.jupiter.api.Assertions.*;

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
    void testGet_AllSupportedMethods() {
        assertSame(creditCardPayment, paymentMethodFactory.get("credit"));
        assertSame(cashPayment, paymentMethodFactory.get("cash"));
        assertSame(qrPayment, paymentMethodFactory.get("qr"));
    }

    @Test
    void testGet_CaseSensitivity() {
        assertThrows(IllegalArgumentException.class, () -> {
            paymentMethodFactory.get("CASH");
        });
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
