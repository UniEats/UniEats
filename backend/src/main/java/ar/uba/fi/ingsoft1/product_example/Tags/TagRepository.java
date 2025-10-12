package ar.uba.fi.ingsoft1.product_example.Tags;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface TagRepository extends JpaRepository<Tag, Long> {

}
