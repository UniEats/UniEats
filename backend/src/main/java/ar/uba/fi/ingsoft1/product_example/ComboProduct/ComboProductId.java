package ar.uba.fi.ingsoft1.product_example.ComboProduct;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ComboProductId implements Serializable {

    private Long comboId;
    private Long productId;

}