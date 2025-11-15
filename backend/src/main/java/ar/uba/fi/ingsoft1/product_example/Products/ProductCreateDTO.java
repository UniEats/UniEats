package ar.uba.fi.ingsoft1.product_example.Products;

import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.DecimalMin;
import java.math.BigDecimal;
import lombok.NonNull;

import java.util.List;

public record ProductCreateDTO(
        @NonNull @Size(min = 1, max = 100) String name,
        @NonNull @Size(min = 1, max = 500) String description,
        @NonNull @Digits(integer = 10, fraction = 2) @DecimalMin("0.00") BigDecimal price,
        @NonNull List<IngredientQuantity> ingredientIds,
        @NonNull List<Long> tagIds,
        @NonNull @Size(min = 1) List<Long> menuSectionIds
) {}
