package ar.uba.fi.ingsoft1.product_example.Combos;

import java.util.List;
import java.math.BigDecimal;
import ar.uba.fi.ingsoft1.product_example.Combos.ProductQuantity;

record ComboUpdateDTO(
        String name,
        String description,
        BigDecimal price,
        List<ProductQuantity> productIds,
        List<Long> menuSectionIds
) {}