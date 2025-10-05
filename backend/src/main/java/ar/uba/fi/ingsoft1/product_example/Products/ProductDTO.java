package ar.uba.fi.ingsoft1.product_example.Products;

import java.math.BigDecimal;
import java.util.List;
import ar.uba.fi.ingsoft1.product_example.Tags.Tag;

public record ProductDTO(
        long id,
        String name,
        String description,
        BigDecimal price,
        List<String> tags
) {
    public ProductDTO(Product product) {
        this(
            product.getId(),
            product.getName(),
            product.getDescription(),
            product.getPrice(),
            product.getTags() != null
                ? product.getTags().stream().map(Tag::getTag).toList()
                : List.of()
        );
    }

}
