package ar.uba.fi.ingsoft1.product_example.Ingredients;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PatchMapping;

import java.util.List;

@RestController
@RequestMapping("/ingredients")
@Validated
@RequiredArgsConstructor
@Tag(name = "Ingredients")
class IngredientRestController {
    private final IngredientService ingredientService;

    @GetMapping
    public List<IngredientDTO> getIngredients() {
        return ingredientService.getIngredients();
    }

    @GetMapping("/{id}")
    public ResponseEntity<IngredientDTO> getIngredientById(@PathVariable long id) {
        return ingredientService.getIngredientById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public IngredientDTO createIngredient(
            @NonNull @RequestBody IngredientCreateDTO data
    ) {
        return ingredientService.createIngredient(data);
    }

    @PatchMapping("/{id}/stock")
    public ResponseEntity<IngredientDTO> increaseStock(
        @PathVariable Long id,
        @RequestParam int amount
    ) {
    try {
        return ingredientService.increaseStock(id, amount)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    } catch (IllegalArgumentException e) {
        return ResponseEntity.badRequest().build();
    }
    }

    @PatchMapping("/{id}")
    public ResponseEntity<IngredientDTO> updateIngredient(
            @PathVariable long id,
            @RequestBody IngredientCreateDTO data
    ) {
        return ingredientService.updateIngredient(id, data)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @org.springframework.web.bind.annotation.DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteIngredient(@PathVariable long id) {
        boolean deleted = ingredientService.deleteIngredient(id);
        return deleted
                ? ResponseEntity.noContent().build()
                : ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }
}
