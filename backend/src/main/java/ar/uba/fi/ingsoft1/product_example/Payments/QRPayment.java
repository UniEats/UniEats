package ar.uba.fi.ingsoft1.product_example.Payments;

import org.springframework.stereotype.Component;
import ar.uba.fi.ingsoft1.product_example.Orders.OrderDTO;

@Component
public class QRPayment implements PaymentMethod {
    @Override
    public PaymentResult processPayment(OrderDTO order) {
        System.out.println("Generando pago QR simulado...");
        return PaymentResult.success("Pago QR simulado");
    }
}
