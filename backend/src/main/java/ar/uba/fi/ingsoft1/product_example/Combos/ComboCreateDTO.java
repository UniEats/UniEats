package ar.uba.fi.ingsoft1.product_example.Combos;

import ar.uba.fi.ingsoft1.product_example.ComboProduct.ComboProduct;
import ar.uba.fi.ingsoft1.product_example.ComboProduct.ComboProductId;

import ar.uba.fi.ingsoft1.product_example.Products.Product;
import ar.uba.fi.ingsoft1.product_example.Tags.Tag;
import ar.uba.fi.ingsoft1.product_example.Combos.ProductQuantity;
import ar.uba.fi.ingsoft1.product_example.MenuSections.MenuSection;

import org.springframework.validation.annotation.Validated;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.DecimalMin;
import java.util.function.LongFunction;
import java.math.BigDecimal;
import lombok.NonNull;

import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

public record ComboCreateDTO(
        @NonNull @Size(min = 1, max = 100) String name,
        @NonNull @Size(min = 1, max = 500) String description,
        @NonNull @Digits(integer = 10, fraction = 2) @DecimalMin("0.00") BigDecimal price,
        @NonNull List<ProductQuantity> productIds,
        @NonNull List<Long> tagIds,
        @NonNull @Size(min = 1) List<Long> menuSectionIds
) {
    public Combo toComboWithProductsAndTags(
            Function<Long, Product> productFetcher,
            Function<Long, Tag> tagFetcher,
            Function<Long, MenuSection> menuSectionFetcher
    ) {
        Combo combo = new Combo(name, description, price);

        List<ComboProduct> comboProducts = productIds.stream()
                .map(entry -> {
                    Long productId = entry.productId();
                    Integer quantity = entry.quantity();

                    Product product = productFetcher.apply(productId);
                    ComboProduct cp = new ComboProduct();
                    cp.setCombo(combo);
                    cp.setProduct(product);
                    cp.setQuantity(quantity);
                    return cp;
                })
                .collect(Collectors.toList());

        List<Tag> tags = tagIds.stream()
                .map(tagFetcher)
                .collect(Collectors.toList());
        combo.setTags(tags);

        List<MenuSection> menuSections = menuSectionIds.stream()
                .map(menuSectionFetcher)
                .collect(Collectors.toList());

        combo.setComboProducts(comboProducts);

        return combo;
    }
}

