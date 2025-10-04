package ar.uba.fi.ingsoft1.product_example.Products;

import java.util.Optional;

record ProductUpdateDTO(
        Optional<String> name,
        Optional<String> description
) {
    public Product applyTo(Product product) {
        name.ifPresent(product::setName);
        description.ifPresent(product::setDescription);
        return product;
    }
}
