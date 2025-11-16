package ar.uba.fi.ingsoft1.product_example.Promotions;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.EntityGraph;

import org.springframework.data.repository.query.Param;
import java.time.DayOfWeek;
import java.util.List;

public interface PromotionRepository extends JpaRepository<Promotion, Long> {
    @EntityGraph(attributePaths = {"products"})
    @Query("SELECT p FROM Promotion p JOIN p.validDays d WHERE p.active = true AND d = :today")
    List<Promotion> findActivePromotions(@Param("today") DayOfWeek today);
}
