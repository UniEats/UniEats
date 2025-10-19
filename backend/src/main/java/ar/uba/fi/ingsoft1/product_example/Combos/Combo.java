package ar.uba.fi.ingsoft1.product_example.Combos;

import ar.uba.fi.ingsoft1.product_example.MenuSections.MenuSection;
import ar.uba.fi.ingsoft1.product_example.ComboProduct.ComboProduct;
import ar.uba.fi.ingsoft1.product_example.Products.Product;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.JoinTable;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import jakarta.persistence.Column;
import jakarta.persistence.CascadeType;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.DecimalMin;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Data;
import lombok.NonNull;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Set;
import java.util.HashSet;
import java.util.List;
import java.util.ArrayList;
import java.util.Map;
import java.util.stream.Collectors;

@Entity
@Table(name = "combo")
@Data
@NoArgsConstructor
@AllArgsConstructor
@RequiredArgsConstructor
public class Combo {

    @Id
    @GeneratedValue
    private Long id;

    @NonNull
    private String name;

    @NonNull
    private String description;

    @NonNull @Digits(integer = 10, fraction = 2)
    @DecimalMin("0.00")
    private BigDecimal price;

    public void setPrice(BigDecimal price) {
        this.price = price.setScale(2, RoundingMode.HALF_UP);
    }

    @Column(name = "image", columnDefinition = "BYTEA")
    private byte[] image;

    @OneToMany(mappedBy = "combo", cascade = {CascadeType.ALL, CascadeType.PERSIST, CascadeType.REMOVE}, orphanRemoval = true)
    private List<ComboProduct> comboProducts = new ArrayList<>();

    @ManyToMany(mappedBy = "combos")
    private List<MenuSection> menuSections = new ArrayList<>();

    public ComboDTO toDTO() {
        Map<Long, String> products = comboProducts != null
                ? comboProducts.stream()
                .collect(Collectors.toMap(
                        cp -> cp.getProduct().getId(),
                        cp -> cp.getProduct().getName()
                ))
                : Map.of();

        Map<Long, Integer> quantities = comboProducts != null
                ? comboProducts.stream()
                .collect(Collectors.toMap(
                        cp -> cp.getProduct().getId(),
                        ComboProduct::getQuantity
                ))
                : Map.of();

        Map<Long, String> menuSections_ = menuSections != null
                ? menuSections.stream()
                .collect(Collectors.toMap(
                        MenuSection::getId,
                        MenuSection::getLabel
                ))
                : Map.of();

        return new ComboDTO(
                this.getId(),
                this.getName(),
                this.getDescription(),
                this.getPrice(),
                products,
                menuSections_,
                this.getImage()
        );
    }
}