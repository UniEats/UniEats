package ar.uba.fi.ingsoft1.product_example.Products;
import ar.uba.fi.ingsoft1.product_example.Tags.Tag;
import ar.uba.fi.ingsoft1.product_example.ProductIngredient.ProductIngredient;
import ar.uba.fi.ingsoft1.product_example.Ingredients.Ingredient;

import java.math.BigDecimal;
import java.util.Map;
import java.util.stream.Collectors;

public record ProductDTO(
        long id,
        String name,
        String description,
        BigDecimal price,
        Map<Long, String> tags,
        Map<Long, String> ingredients,
        byte[] image
) {
    public ProductDTO(Product product) {
        this(
            product.getId(),
            product.getName(),
            product.getDescription(),
            product.getPrice(),
            product.getTags() != null
                ? product.getTags().stream()
                    .collect(Collectors.toMap(
                        Tag::getId,
                        Tag::getTag
                    ))
                : Map.of(),
            product.getProductIngredients() != null
                ? product.getProductIngredients().stream()
                .map(ProductIngredient::getIngredient)
                .collect(Collectors.toMap(
                    Ingredient::getId,
                    Ingredient::getName
                ))
                : Map.of(),
            product.getImage()
        );
    }

}
