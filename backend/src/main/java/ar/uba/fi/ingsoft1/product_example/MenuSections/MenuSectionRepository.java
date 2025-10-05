package ar.uba.fi.ingsoft1.product_example.MenuSection;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface MenuSectionRepository extends JpaRepository<MenuSection, Long> {
    
}
