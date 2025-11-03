package ar.uba.fi.ingsoft1.product_example.Products;
import ar.uba.fi.ingsoft1.product_example.ProductIngredient.ProductIngredient;
import ar.uba.fi.ingsoft1.product_example.Tags.Tag;
import ar.uba.fi.ingsoft1.product_example.MenuSections.MenuSection;
import ar.uba.fi.ingsoft1.product_example.Products.IngredientQuantity;


import java.util.List;
import java.math.BigDecimal;
import java.util.Optional;
import java.math.BigDecimal;

record ProductUpdateDTO(
        String name,
        String description,
        BigDecimal price,
        List<IngredientQuantity> ingredientIds,
        List<Long> tagIds,
        List<Long> menuSectionIds
) {}
