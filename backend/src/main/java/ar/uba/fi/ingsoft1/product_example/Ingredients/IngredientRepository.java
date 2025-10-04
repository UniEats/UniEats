package ar.uba.fi.ingsoft1.product_example.Ingredients;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface IngredientRepository extends JpaRepository<Ingredient, Long> {

    Optional<Ingredient> findById(Long id);
}
