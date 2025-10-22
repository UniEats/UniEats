package ar.uba.fi.ingsoft1.product_example.MenuSections;

import ar.uba.fi.ingsoft1.product_example.Products.Product;
import ar.uba.fi.ingsoft1.product_example.Products.ProductDTO;
import ar.uba.fi.ingsoft1.product_example.Combos.Combo;
import ar.uba.fi.ingsoft1.product_example.Combos.ComboDTO;

import java.util.List;

public record MenuSectionDTO(
        long id,
        String label,
        String description,
        List<ProductDTO> products,
        List<ComboDTO> combos
) {
    public MenuSectionDTO(MenuSection menu_section) {
        this(
            menu_section.getId(),
            menu_section.getLabel(),
            menu_section.getDescription(),
            menu_section.getProducts() != null
                ? menu_section.getProducts().stream()
                    .map(product -> new ProductDTO(product))
                        .toList()
                : List.of(),
            menu_section.getCombos() != null
                ? menu_section.getCombos().stream()
                    .map(combo -> new ComboDTO(combo))
                        .toList()
                : List.of()
        );
    }
}
