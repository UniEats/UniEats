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
import java.util.HashMap;
import java.util.stream.Collectors;
import java.util.Collections;

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
        List<Map<String, Object>> productList = comboProducts != null
                ? comboProducts.stream()
                        .map(cp -> {
                        Map<String, Object> productMap = new HashMap<>();
                        productMap.put("id", cp.getProduct().getId());
                        productMap.put("name", cp.getProduct().getName());
                        productMap.put("quantity", cp.getQuantity());
                        return productMap;
                        })
                        .collect(Collectors.toList())
                : Collections.emptyList();

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
                productList,
                menuSections_,
                this.getImage()
        );
    }
}