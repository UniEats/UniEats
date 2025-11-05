package ar.uba.fi.ingsoft1.product_example.Products;
import ar.uba.fi.ingsoft1.product_example.Tags.Tag;
import ar.uba.fi.ingsoft1.product_example.ProductIngredient.ProductIngredient;
import ar.uba.fi.ingsoft1.product_example.Ingredients.Ingredient;
import ar.uba.fi.ingsoft1.product_example.MenuSections.MenuSection;

import java.math.BigDecimal;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.HashMap;
import java.util.List;
import java.util.ArrayList;
import java.util.Collections;

public record ProductDTO(
        long id,
        String name,
        String description,
        BigDecimal price,
        Map<Long, String> tags,
        List<Map<String, Object>> ingredients,
        Map<Long, String> menuSections,
        byte[] image,
        Boolean available
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
                            .map(pi -> {
                                Map<String, Object> ingredientMap = new HashMap<>();
                                ingredientMap.put("id", pi.getIngredient().getId());
                                ingredientMap.put("name", pi.getIngredient().getName());
                                ingredientMap.put("quantity", pi.getQuantity());
                                return ingredientMap;
                            })
                            .collect(Collectors.toList())
                            : Collections.emptyList(),
            product.getMenuSections() != null
                ? product.getMenuSections().stream()
                    .collect(Collectors.toMap(
                        MenuSection::getId,
                        MenuSection::getLabel
                    ))
                : Map.of(),
            product.getImage(),
            product.isAvailable()
        );
    }
}
