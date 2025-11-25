package ar.uba.fi.ingsoft1.product_example.OrderDetails;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/order-details")
@Validated
@RequiredArgsConstructor
public class OrderDetailRestController {

    private final OrderDetailService orderDetailService;

    @GetMapping("/order/{orderId}")
    public List<OrderDetailDTO> getDetailsByOrderId(@PathVariable Long orderId) {
        return orderDetailService.getDetailsByOrderId(orderId);
    }

    @PatchMapping("/{id}")
    public Optional<OrderDetailDTO> updateDetail(
            @PathVariable Long id,
            @RequestBody OrderDetailUpdateDTO dto
    ) {
        return orderDetailService.updateOrderDetail(id, dto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDetail(@PathVariable Long id) {
        boolean deleted = orderDetailService.deleteOrderDetail(id);
        return deleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }
}
