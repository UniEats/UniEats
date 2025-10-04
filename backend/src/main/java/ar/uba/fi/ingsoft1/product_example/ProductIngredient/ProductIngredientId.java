package ar.uba.fi.ingsoft1.product_example.ProductIngredient;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductIngredientId implements Serializable {

    private Long productId;
    private Long ingredientId;

}
