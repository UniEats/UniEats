package ar.uba.fi.ingsoft1.product_example.Products;

import ar.uba.fi.ingsoft1.product_example.ProductIngredient.ProductIngredient;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
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

@Entity
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

    @NonNull @Digits(integer = 10, fraction = 2) @DecimalMin("0.00")
    private BigDecimal price;

    public void setPrice(BigDecimal price) {
            this.price = price.setScale(2, RoundingMode.HALF_UP);
    }

    @OneToMany(mappedBy = "product")
    private List<ProductIngredient> productIngredients;

    public ProductDTO toDTO() {
        return new ProductDTO(
                this.getId(),
                this.getName(),
                this.getDescription(),
                this.getPrice()
        );
    }
}
