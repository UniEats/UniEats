package ar.uba.fi.ingsoft1.product_example.Payments;

import org.springframework.stereotype.Component;
import ar.uba.fi.ingsoft1.product_example.Orders.OrderDTO;

@Component
public class CreditCardPayment implements PaymentMethod {
    @Override
    public PaymentResult processPayment(OrderDTO order) {
        // TODO: integración futura
        System.out.println("Procesando pago con tarjeta...");
        return PaymentResult.success("Pago simulado con tarjeta");
    }
}
