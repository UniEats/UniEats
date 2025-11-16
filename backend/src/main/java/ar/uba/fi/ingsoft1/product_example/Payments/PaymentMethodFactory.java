package ar.uba.fi.ingsoft1.product_example.Payments;

import org.springframework.stereotype.Service;
import java.util.Map;

@Service
public class PaymentMethodFactory {

    private final Map<String, PaymentMethod> methods;

    public PaymentMethodFactory(
        CreditCardPayment credit,
        CashPayment cash,
        QRPayment qr
    ) {
        this.methods = Map.of(
            "credit", credit,
            "cash", cash,
            "qr", qr
        );
    }

    public PaymentMethod get(String type) {
        if (!methods.containsKey(type)) {
            throw new IllegalArgumentException("Unsupported payment method: " + type);
        }
        return methods.get(type);
    }
}
