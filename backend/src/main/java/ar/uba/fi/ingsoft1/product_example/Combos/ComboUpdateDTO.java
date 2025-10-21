package ar.uba.fi.ingsoft1.product_example.Combos;
import ar.uba.fi.ingsoft1.product_example.Tags.Tag;

import java.util.List;
import java.math.BigDecimal;
import ar.uba.fi.ingsoft1.product_example.Combos.ProductQuantity;

record ComboUpdateDTO(
        String name,
        String description,
        BigDecimal price,
        List<ProductQuantity> productIds,
        List<Long> tagIds,
        List<Long> menuSectionIds
) {}