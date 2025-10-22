package ar.uba.fi.ingsoft1.product_example.Combos;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ComboRepository extends JpaRepository<Combo, Long> {
    @Query("SELECT c FROM Combo c " +
            "JOIN c.comboProducts cp " +
            "JOIN cp.product p " +
            "JOIN p.productIngredients pi " +
            "WHERE pi.ingredient.stock >= 1 " +
            "GROUP BY c.id " +
            "HAVING COUNT(DISTINCT pi) = ( " +
            "SELECT COUNT(DISTINCT pi2) FROM Combo c2 " +
            "JOIN c2.comboProducts cp2 " +
            "JOIN cp2.product p2 " +
            "JOIN p2.productIngredients pi2 " +
            "WHERE c2.id = c.id )")

    List<Combo> findCombosWithAllProductsInStock();

    List<Combo> findAll();

    List<Combo> findByTags_Id(Long tagId);
}