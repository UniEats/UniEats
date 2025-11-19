package ar.uba.fi.ingsoft1.product_example.Payments;

public class PaymentResult {

    private final boolean success;
    private final String message;

    private PaymentResult(boolean success, String message) {
        this.success = success;
        this.message = message;
    }

    public static PaymentResult success(String msg) {
        return new PaymentResult(true, msg);
    }

    public static PaymentResult failure(String msg) {
        return new PaymentResult(false, msg);
    }

    public boolean isSuccess() {
        return success;
    }

    public String getMessage() {
        return message;
    }
}
