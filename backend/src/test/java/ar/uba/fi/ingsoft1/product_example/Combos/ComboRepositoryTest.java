package ar.uba.fi.ingsoft1.product_example.Combos;

import ar.uba.fi.ingsoft1.product_example.ComboProduct.ComboProduct;
import ar.uba.fi.ingsoft1.product_example.ComboProduct.ComboProductId;
import ar.uba.fi.ingsoft1.product_example.ComboProduct.ComboProductRepository;
import ar.uba.fi.ingsoft1.product_example.Ingredients.Ingredient;
import ar.uba.fi.ingsoft1.product_example.Ingredients.IngredientRepository;
import ar.uba.fi.ingsoft1.product_example.ProductIngredient.ProductIngredient;
import ar.uba.fi.ingsoft1.product_example.ProductIngredient.ProductIngredientId;
import ar.uba.fi.ingsoft1.product_example.ProductIngredient.ProductIngredientRepository;
import ar.uba.fi.ingsoft1.product_example.Products.Product;
import ar.uba.fi.ingsoft1.product_example.Products.ProductRepository;
import ar.uba.fi.ingsoft1.product_example.ProductIngredient.ProductIngredient;
import ar.uba.fi.ingsoft1.product_example.Tags.Tag;
import ar.uba.fi.ingsoft1.product_example.Tags.TagRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.TestPropertySource;

import static org.junit.jupiter.api.Assertions.*;

import java.util.List;

@DataJpaTest
@TestPropertySource(properties = {
        "spring.sql.init.mode=never"
})
class ComboRepositoryTest {

    @Autowired
    private ComboRepository comboRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private IngredientRepository ingredientRepository;

    @Autowired
    private ProductIngredientRepository productIngredientRepository;

    @Autowired
    private ComboProductRepository comboProductRepository;

    @Autowired
    private TagRepository tagRepository;

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

    ComboProduct setAllComboProduct(Product product, Combo combo, int quantity) {
        ComboProduct pc = new ComboProduct();
        ComboProductId pcId = new ComboProductId();
        pcId.setProductId(product.getId());
        pcId.setComboId(combo.getId());
        pc.setId(pcId);
        pc.setProduct(product);
        pc.setCombo(combo);
        pc.setQuantity(quantity);
        return pc;
    }

    @Test
    void findCombosWithAllProductsInStock() {
        Ingredient flour = ingredientRepository.save(new Ingredient("Flour", "-", 5));
        Ingredient sugar = ingredientRepository.save(new Ingredient("Sugar", "-", 3));
        Ingredient eggs = ingredientRepository.save(new Ingredient("Eggs", "-", 0));

        Product cake = new Product();
        cake.setName("Cake");
        productRepository.save(cake);
        productIngredientRepository.save(setAllProductIngredient(cake, flour, 1));
        productIngredientRepository.save(setAllProductIngredient(cake, sugar, 1));

        Product pancake = new Product();
        pancake.setName("Pancake");
        productRepository.save(pancake);
        productIngredientRepository.save(setAllProductIngredient(pancake, flour, 1));
        productIngredientRepository.save(setAllProductIngredient(pancake, eggs, 1));

        Combo combo1 = new Combo();
        combo1.setName("Combo 1");
        comboRepository.save(combo1);

        comboProductRepository.save(setAllComboProduct(cake, combo1, 1));

        Combo combo2 = new Combo();
        combo2.setName("Combo 2");
        comboRepository.save(combo2);

        comboProductRepository.save(setAllComboProduct(pancake, combo2, 1));

        List<Combo> result = comboRepository.findCombosWithAllProductsInStock();

        assertEquals(1, result.size());
        assertEquals("Combo 1", result.get(0).getName());
    }

    @Test
    void findAllCombos() {
        Combo combo1 = new Combo();
        combo1.setName("Combo 1");
        comboRepository.save(combo1);

        Combo combo2 = new Combo();
        combo2.setName("Combo 2");
        comboRepository.save(combo2);

        List<Combo> result = comboRepository.findAll();

        assertEquals(2, result.size());
        assertTrue(result.stream().anyMatch(combo -> combo.getName().equals("Combo 1")));
        assertTrue(result.stream().anyMatch(combo -> combo.getName().equals("Combo 2")));
    }

    @Test
    void findCombosByTagId() {
        Tag tag = new Tag();
        tag.setTag("Discount");
        tagRepository.save(tag);

        Combo combo1 = new Combo();
        combo1.setName("Combo 1");
        combo1.getTags().add(tag);
        comboRepository.save(combo1);

        Combo combo2 = new Combo();
        combo2.setName("Combo 2");
        combo2.getTags().add(tag);
        comboRepository.save(combo2);

        List<Combo> result = comboRepository.findByTags_Id(tag.getId());

        assertEquals(2, result.size());
        assertTrue(result.stream().anyMatch(combo -> combo.getName().equals("Combo 1")));
        assertTrue(result.stream().anyMatch(combo -> combo.getName().equals("Combo 2")));
    }
}
