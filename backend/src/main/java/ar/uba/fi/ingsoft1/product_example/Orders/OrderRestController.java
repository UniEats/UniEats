package ar.uba.fi.ingsoft1.product_example.Orders;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/orders")
@Validated
@RequiredArgsConstructor
class OrderRestController {
    private final OrderService orderService;

    @GetMapping
    public List<OrderDTO> getAllOrders() {
        return orderService.geAlltOrders();
    }

    @GetMapping("/all-menu-items-in-stock")
    public List<OrderDTO> getOrdersWithAllMenuItemsInStock() {
        return orderService.getOrdersWithAllMenuItemsInStock();
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderDTO> getOrderById(@PathVariable long id) {
        return orderService.getOrderById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<OrderDTO> createOrder(
            @RequestBody @Validated OrderCreateDTO dto
    ) {
        Long userId = 1L;
        return orderService.createOrder(dto, userId)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.INTERNAL_SERVER_ERROR, "Order could not be created"
                ));
    }

    @PatchMapping("/{id}")
    public Optional<OrderDTO> updateOrder(
            @PathVariable Long id,
            @RequestBody OrderUpdateDTO dto
    ) {
        return orderService.updateOrder(id, dto);
    }

    @PostMapping("/{id}/start-preparation")
    public ResponseEntity<OrderDTO> startPreparation(@PathVariable Long id) {
        return orderService.startPreparation(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }
    @PostMapping("/{id}/mark-ready")
    public ResponseEntity<OrderDTO> markReady(@PathVariable Long id) {
        return orderService.markReady(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @PostMapping("/{id}/pickup")
    public ResponseEntity<OrderDTO> pickup(@PathVariable Long id) {
        return orderService.pickup(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }
    @PostMapping("/{id}/cancel")
    public ResponseEntity<OrderDTO> cancelOrder(@PathVariable Long id) {
        return orderService.cancelOrder(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable long id) {
        boolean deleted = orderService.deleteOrder(id);
        return deleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }
}
