package ar.uba.fi.ingsoft1.product_example.Products;

import java.util.Optional;
import java.math.BigDecimal;

public record ProductUpdateDTO(
        Optional<String> name,
        Optional<String> description,
        Optional<BigDecimal> price
) {
    public Product applyTo(Product product) {
        name.ifPresent(product::setName);
        description.ifPresent(product::setDescription);
        price.ifPresent(product::setPrice);
        return product;
    }
}
