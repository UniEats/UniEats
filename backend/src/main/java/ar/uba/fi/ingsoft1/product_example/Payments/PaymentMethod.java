package ar.uba.fi.ingsoft1.product_example.Payments;

import ar.uba.fi.ingsoft1.product_example.Orders.OrderDTO;

public interface PaymentMethod {
    PaymentResult processPayment(OrderDTO order);
}
