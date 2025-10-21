package ar.uba.fi.ingsoft1.product_example.Tags;

import ar.uba.fi.ingsoft1.product_example.Products.Product;
import ar.uba.fi.ingsoft1.product_example.Combos.Combo;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToMany;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.NonNull;

import java.util.List;
import java.util.ArrayList;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@RequiredArgsConstructor
public class Tag {

    @Id
    @GeneratedValue
    private Long id;

    @NonNull
    private String tag;
    
    @ManyToMany(mappedBy = "tags")
    private List<Product> products  = new ArrayList<>();

    @ManyToMany(mappedBy ="tags")
    private List<Combo> combos = new ArrayList<>();
}
