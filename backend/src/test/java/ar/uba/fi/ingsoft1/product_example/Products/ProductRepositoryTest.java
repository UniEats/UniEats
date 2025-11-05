package ar.uba.fi.ingsoft1.product_example.Products;

import ar.uba.fi.ingsoft1.product_example.Ingredients.Ingredient;
import ar.uba.fi.ingsoft1.product_example.Ingredients.IngredientRepository;
import ar.uba.fi.ingsoft1.product_example.ProductIngredient.ProductIngredient;
import ar.uba.fi.ingsoft1.product_example.ProductIngredient.ProductIngredientId;
import ar.uba.fi.ingsoft1.product_example.ProductIngredient.ProductIngredientRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.TestPropertySource;

import java.util.List;
import java.util.Arrays;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@TestPropertySource(properties = {
        "spring.sql.init.mode=never"
})
class ProductRepositoryTest {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private IngredientRepository ingredientRepository;

    @Autowired
    private ProductIngredientRepository productIngredientRepository;

    ProductIngredient setAllProductIngredient(Product product, Ingredient ingredient, int quantity) {
        ProductIngredient pi = new ProductIngredient();
        ProductIngredientId piId = new ProductIngredientId();
        piId.setProductId(product.getId());
        piId.setIngredientId(ingredient.getId());
        pi.setId(piId);
        pi.setProduct(product);
        pi.setIngredient(ingredient);
        pi.setQuantity(quantity);
        return pi;
    }

    @Test
    void findProductsWithAllIngredientsInStock() {
        // Ingredients
        Ingredient flour = ingredientRepository.save(new Ingredient("Flour", "-", 5));
        Ingredient sugar = ingredientRepository.save(new Ingredient("Sugar", "-", 3));
        Ingredient eggs = ingredientRepository.save(new Ingredient("Eggs", "-", 0));

        // All ingredients in stock
        Product cake = new Product();
        cake.setName("Cake");
        productRepository.save(cake);

        productIngredientRepository.save(setAllProductIngredient(cake, flour, 1));
        productIngredientRepository.save(setAllProductIngredient(cake, sugar, 1));

        // One ingredient without stock
        Product pancake = new Product();
        pancake.setName("Pancake");
        productRepository.save(pancake);

        productIngredientRepository.save(setAllProductIngredient(pancake, flour, 1));
        productIngredientRepository.save(setAllProductIngredient(pancake, eggs, 1));

        List<Product> result = productRepository.findProductsWithAllIngredientsInStock();

        assertEquals(1, result.size());
        assertEquals("Cake", result.get(0).getName());
    }
}
