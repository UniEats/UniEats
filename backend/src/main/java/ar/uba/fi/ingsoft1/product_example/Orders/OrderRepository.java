package ar.uba.fi.ingsoft1.product_example.Orders;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findAll();

    List<Order> findByUser_Id(Long userId);
}