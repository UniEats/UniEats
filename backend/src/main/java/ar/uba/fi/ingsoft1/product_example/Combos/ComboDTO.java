package ar.uba.fi.ingsoft1.product_example.Combos;
import ar.uba.fi.ingsoft1.product_example.Products.Product;
import ar.uba.fi.ingsoft1.product_example.ComboProduct.ComboProduct;
import ar.uba.fi.ingsoft1.product_example.MenuSections.MenuSection;

import java.math.BigDecimal;
import java.util.Map;
import java.util.stream.Collectors;

public record ComboDTO(
        long id,
        String name,
        String description,
        BigDecimal price,
        Map<Long, String> products,
        Map<Long, String> menuSections,
        byte[] image
) {
    public ComboDTO(Combo combo) {
        this(
                combo.getId(),
                combo.getName(),
                combo.getDescription(),
                combo.getPrice(),
                combo.getComboProducts() != null
                        ? combo.getComboProducts().stream()
                        .collect(Collectors.toMap(
                                cp -> cp.getProduct().getId(),
                                cp -> cp.getProduct().getName() + " x" + cp.getQuantity()
                        ))
                        : Map.of(),
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