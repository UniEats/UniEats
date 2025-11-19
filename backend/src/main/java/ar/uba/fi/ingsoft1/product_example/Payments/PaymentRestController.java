package ar.uba.fi.ingsoft1.product_example.Payments;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import ar.uba.fi.ingsoft1.product_example.Orders.OrderService;
import ar.uba.fi.ingsoft1.product_example.Orders.OrderDTO;
import jakarta.persistence.EntityNotFoundException;

@RequiredArgsConstructor
@RestController
@RequestMapping("/payments")
public class PaymentRestController {

    private final PaymentMethodFactory paymentFactory;
    private final OrderService orderService;

    @PostMapping("/{orderId}")
    public ResponseEntity<?> pay(
        @PathVariable Long orderId,
        @RequestParam String method
    ) {
        OrderDTO order = orderService.getOrderById(orderId).orElseThrow(() -> new EntityNotFoundException("Order not found with id: " + orderId));

        PaymentMethod payment = paymentFactory.get(method);

        PaymentResult result = payment.processPayment(order);

        return ResponseEntity.ok(result);
    }
}
