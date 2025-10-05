package ar.uba.fi.ingsoft1.product_example.MenuSection;

import ar.uba.fi.ingsoft1.product_example.ProductIngredient.ProductIngredient;
import ar.uba.fi.ingsoft1.product_example.ProductIngredient.ProductIngredientId;

import ar.uba.fi.ingsoft1.product_example.Ingredients.Ingredient;
import ar.uba.fi.ingsoft1.product_example.Tags.Tag;

import org.springframework.validation.annotation.Validated;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.DecimalMin;
import java.util.function.LongFunction;
import java.math.BigDecimal;
import lombok.NonNull;

import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

public record MenuSectionCreateDTO(
        @NonNull String label,
        @NonNull String description
) {
    public MenuSection asMenuSection() {
        return new MenuSection(label, description);
    }
}

