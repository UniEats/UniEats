package ar.uba.fi.ingsoft1.product_example.Products;

import java.math.BigDecimal;

record ProductDTO(
        long id,
        String name,
        String description,
        BigDecimal price
) {
    public ProductDTO(Product product) {
        this(product.getId(), product.getName(), product.getDescription(), product.getPrice());
    }

}
