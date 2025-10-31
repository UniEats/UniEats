package ar.uba.fi.ingsoft1.product_example.Orders;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    @Query("""
        SELECT DISTINCT o 
        FROM Order o
        JOIN o.details d
        LEFT JOIN Product p ON d.productId = p.id
        LEFT JOIN Combo c ON d.comboId = c.id
        WHERE (d.productId IS NULL OR p.stock > 0)
            AND (d.comboId IS NULL OR c.stock > 0)
    """)
    List<Order> findOrdersWithAllMenuItemsInStock();

    List<Order> findAll();
}