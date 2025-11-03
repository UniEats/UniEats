package ar.uba.fi.ingsoft1.product_example.Products;

import ar.uba.fi.ingsoft1.product_example.ProductIngredient.ProductIngredient;
import ar.uba.fi.ingsoft1.product_example.ProductIngredient.ProductIngredientId;

import ar.uba.fi.ingsoft1.product_example.Ingredients.Ingredient;
import ar.uba.fi.ingsoft1.product_example.Tags.Tag;
import ar.uba.fi.ingsoft1.product_example.Products.IngredientQuantity;
import ar.uba.fi.ingsoft1.product_example.MenuSections.MenuSection;

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

public record ProductCreateDTO(
        @NonNull @Size(min = 1, max = 100) String name,
        @NonNull @Size(min = 1, max = 500) String description,
        @NonNull @Digits(integer = 10, fraction = 2) @DecimalMin("0.00") BigDecimal price,
        @NonNull List<IngredientQuantity> ingredientIds,
        @NonNull List<Long> tagIds,
        @NonNull @Size(min = 1) List<Long> menuSectionIds
) {
    public Product toProductWithIngredientsAndTags(
            Function<Long, Ingredient> ingredientFetcher,
            Function<Long, Tag> tagFetcher,
            Function<Long, MenuSection> menuSectionFetcher
    ) {
        Product product = new Product(name, description, price);

        List<ProductIngredient> productIngredients = ingredientIds.stream()
                .map(entry -> {
                    Long ingredientId = entry.ingredientId();
                    Integer quantity = entry.quantity();

                    Ingredient ingredient = ingredientFetcher.apply(ingredientId);
                    ProductIngredient pi = new ProductIngredient();
                    pi.setProduct(product);
                    pi.setIngredient(ingredient);
                    pi.setQuantity(quantity);
                    return pi;
                })
                .collect(Collectors.toList());

        List<Tag> tags = tagIds.stream()
                .map(tagFetcher)
                .collect(Collectors.toList());
        product.setTags(tags);

        List<MenuSection> menuSections = menuSectionIds.stream()
                .map(menuSectionFetcher)
                .collect(Collectors.toList());

        product.setProductIngredients(productIngredients);

        return product;
    }
}
