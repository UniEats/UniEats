package ar.uba.fi.ingsoft1.product_example.ProductIngredient;

import ar.uba.fi.ingsoft1.product_example.Products.Product; 
import ar.uba.fi.ingsoft1.product_example.Ingredients.Ingredient; 

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.OneToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductIngredient {

    @EmbeddedId
    private ProductIngredientId id;

    @ManyToOne
    @MapsId("productId")
    @JoinColumn(name = "id_prod")
    private Product product;

    @ManyToOne
    @MapsId("ingredientId")
    @JoinColumn(name = "id_ing")
    private Ingredient ingredient;

    @Column(nullable = false)
    private Integer quantity;

}