package ar.uba.fi.ingsoft1.product_example.Products;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    @Query("SELECT p FROM Product p " +
           "JOIN p.productIngredients pi " +
           "WHERE pi.ingredient.stock >= 1 " +
           "GROUP BY p.id " +
           "HAVING COUNT(pi) = ( " + 
                        "SELECT COUNT(pi2) FROM ProductIngredient pi2 " +
                        "WHERE pi2.product = p )")
           
    List<Product> findProductsWithAllIngredientsInStock();
    
    List<Product> findAll();

    // find products that have a tag with the given id
    List<Product> findByTags_Id(Long tagId);
}
