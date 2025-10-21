package ar.uba.fi.ingsoft1.product_example.Combos;
import ar.uba.fi.ingsoft1.product_example.Products.Product;
import ar.uba.fi.ingsoft1.product_example.ComboProduct.ComboProduct;
import ar.uba.fi.ingsoft1.product_example.MenuSections.MenuSection;

import java.math.BigDecimal;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.HashMap;
import java.util.List;
import java.util.ArrayList;
import java.util.Collections;

public record ComboDTO(
        long id,
        String name,
        String description,
        BigDecimal price,
        Map<Long, String> tags,
        List<Map<String, Object>> products,
        Map<Long, String> menuSections,
        byte[] image
) {
    public ComboDTO(Combo combo) {
        this(
                combo.getId(),
                combo.getName(),
                combo.getDescription(),
                combo.getPrice(),
                combo.getTags() != null
                        ? combo.getTags().stream()
                        .collect(Collectors.toMap(
                                Tag::getId,
                                Tag::getTag
                        ))
                        : Map.of(),
                combo.getComboProducts() != null
                        ? combo.getComboProducts().stream()
                                .map(cp -> {
                                Map<String, Object> productMap = new HashMap<>();
                                productMap.put("id", cp.getProduct().getId());
                                productMap.put("name", cp.getProduct().getName());
                                productMap.put("quantity", cp.getQuantity());
                                return productMap;
                                })
                                .collect(Collectors.toList())
                        : Collections.emptyList(),
                combo.getMenuSections() != null
                        ? combo.getMenuSections().stream()
                        .collect(Collectors.toMap(
                                MenuSection::getId,
                                MenuSection::getLabel
                        ))
                        : Map.of(),
                combo.getImage()
         );
    }
}