package ar.uba.fi.ingsoft1.product_example.Payments;

import org.springframework.stereotype.Component;
import ar.uba.fi.ingsoft1.product_example.Orders.OrderDTO;

@Component
public class CashPayment implements PaymentMethod {
    @Override
    public PaymentResult processPayment(OrderDTO order) {
        System.out.println("Pago marcado como en efectivo...");
        return PaymentResult.success("Pago grabado como efectivo");
    }
}
