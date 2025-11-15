package ar.uba.fi.ingsoft1.product_example.Promotions;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/promotions")
@Validated
@RequiredArgsConstructor
public class PromotionRestController {
    private final PromotionService promotionService;

    @GetMapping
    public List<PromotionDTO> getAllPromotions() {
        return promotionService.getAllPromotions();
    }

    @GetMapping("/active")
    public List<PromotionDTO> getPromotionsActiveNow() {
        return promotionService.getPromotionsDTOActiveNow();
    }

    @GetMapping("/{id}")
    public ResponseEntity<PromotionDTO> getPromotionById(@PathVariable Long id) {
        return promotionService.getPromotionById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<PromotionDTO> createPromotion(@RequestBody PromotionCreateDTO dto) {
    return promotionService.createPromotion(dto)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.badRequest().build());
    }

    @PatchMapping("/{id}")
    public ResponseEntity<PromotionDTO> updatePromotion(
            @PathVariable Long id,
            @RequestBody PromotionUpdateDTO dto
    ) {
        return promotionService.updatePromotion(id, dto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePromotion(@PathVariable Long id) {
        boolean deleted = promotionService.deletePromotion(id);
        return deleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }

    @PostMapping("/{id}/toggle-active")
    public ResponseEntity<PromotionDTO> toggleActive(@PathVariable Long id) {
        return promotionService.togglePromotionActive(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
