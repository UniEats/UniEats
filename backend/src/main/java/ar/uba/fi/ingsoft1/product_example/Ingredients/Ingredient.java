package ar.uba.fi.ingsoft1.product_example.Ingredients;

import ar.uba.fi.ingsoft1.product_example.ProductIngredient.ProductIngredient;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.NonNull;

import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@RequiredArgsConstructor
public class Ingredient {

    @Id
    @GeneratedValue
    private Long id;

    @NonNull
    private String name;

    @NonNull
    private String description;
    
    private int stock;

    public Ingredient(@NonNull String name, @NonNull String description, int stock) {
        if (stock < 0) {
            throw new IllegalArgumentException("Stock cannot be negative.");
        }
        this.name = name;
        this.description = description;
        this.stock = stock;
    }

    @OneToMany(mappedBy = "ingredient")
    private List<ProductIngredient> productIngredients;
}
