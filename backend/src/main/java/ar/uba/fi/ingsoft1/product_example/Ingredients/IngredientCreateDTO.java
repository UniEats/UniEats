package ar.uba.fi.ingsoft1.product_example.Ingredients;

import jakarta.validation.constraints.Min;
import lombok.NonNull;

public record IngredientCreateDTO(
        @NonNull String name, 
        @NonNull String description, 
        @Min(0) int stock
) {
    public Ingredient asIngredient() {
        return new Ingredient(name, description, stock);
    }
}
