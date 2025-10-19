package ar.uba.fi.ingsoft1.product_example.ComboProduct;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ComboProductRepository extends JpaRepository<ComboProduct, ComboProductId> {
    void deleteById_ProductId(Long productId);
}