package ar.uba.fi.ingsoft1.product_example.Products;

import ar.uba.fi.ingsoft1.product_example.MenuSections.MenuSection;
import ar.uba.fi.ingsoft1.product_example.ProductIngredient.ProductIngredient;
import ar.uba.fi.ingsoft1.product_example.Tags.Tag;
import ar.uba.fi.ingsoft1.product_example.Ingredients.Ingredient;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.JoinTable;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import jakarta.persistence.Column;
import jakarta.persistence.CascadeType;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.DecimalMin;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Data;
import lombok.NonNull;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.ArrayList;
import java.util.Map;
import java.util.stream.Collectors;

@Entity
@Table(name = "product")
@Data
@NoArgsConstructor
@AllArgsConstructor
@RequiredArgsConstructor
public class Product {

    @Id
    @GeneratedValue
    private Long id;

    @NonNull
    private String name;

    @NonNull
    private String description;

    @NonNull @Digits(integer = 10, fraction = 2)
    @DecimalMin("0.00")
    private BigDecimal price;

    public void setPrice(BigDecimal price) {
        this.price = price.setScale(2, RoundingMode.HALF_UP);
    }

    @Column(name = "image", columnDefinition = "BYTEA")
    private byte[] image;

    @OneToMany(mappedBy = "product", cascade = {CascadeType.ALL, CascadeType.PERSIST, CascadeType.REMOVE}, orphanRemoval = true)
    private List<ProductIngredient> productIngredients = new ArrayList<>();

    @ManyToMany
    @JoinTable(
            name = "product_tag",
            joinColumns = @JoinColumn(name = "product_id"),
            inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    private List<Tag> tags = new ArrayList<>();

    @ManyToMany(mappedBy = "products")
    private List<MenuSection> menuSections = new ArrayList<>();

    public ProductDTO toDTO() {
        Map<Long, String> tagNames = tags != null
                ? tags.stream()
                    .collect(Collectors.toMap(
                        Tag::getId,
                        Tag::getTag
                    ))
                : Map.of();
        Map<Long, String> ingredients = productIngredients != null
            ? productIngredients.stream()
                .map(ProductIngredient::getIngredient)
                .collect(Collectors.toMap(
                    Ingredient::getId,  
                    Ingredient::getName 
                ))
            : Map.of();

        return new ProductDTO(
            this.getId(),
            this.getName(),
            this.getDescription(),
            this.getPrice(),
            tagNames,
            ingredients,
            this.getImage()
        );
    }  


}
