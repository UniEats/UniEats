package ar.uba.fi.ingsoft1.product_example.Orders;

import ar.uba.fi.ingsoft1.product_example.OrderDetails.OrderDetailCreateDTO;
import lombok.NonNull;
import java.util.List;

public record OrderCreateDTO(
        @NonNull List<OrderDetailCreateDTO> details
) {}
