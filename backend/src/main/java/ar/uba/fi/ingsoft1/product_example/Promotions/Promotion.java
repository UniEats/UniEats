package ar.uba.fi.ingsoft1.product_example.Promotions;

import ar.uba.fi.ingsoft1.product_example.Products.Product;
import ar.uba.fi.ingsoft1.product_example.Combos.Combo;
import ar.uba.fi.ingsoft1.product_example.Orders.Order;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.NonNull;
import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;

import java.time.LocalDate;
import java.util.Set;
import java.time.DayOfWeek;
import java.util.HashSet;

@Entity
@Table(name = "promotion")
@Inheritance(strategy = InheritanceType.JOINED)
@Data
@NoArgsConstructor
@AllArgsConstructor
public abstract class Promotion {
    @Id
    @GeneratedValue
    private Long id;

    @NonNull
    private String name;

    private String description;

    private boolean active = true;

    @ManyToMany(fetch = FetchType.EAGER)
    @Fetch(FetchMode.SELECT)
    @JoinTable(
        name = "promotion_products",
        joinColumns = @JoinColumn(name = "promotion_id"),
        inverseJoinColumns = @JoinColumn(name = "product_id")
    )
    private Set<Product> products = new HashSet<>();

    @ManyToMany(fetch = FetchType.EAGER)
    @Fetch(FetchMode.SELECT)
    @JoinTable(
        name = "promotion_combos",
        joinColumns = @JoinColumn(name = "promotion_id"),
        inverseJoinColumns = @JoinColumn(name = "combo_id")
    )
    private Set<Combo> combos = new HashSet<>();

    public boolean isCurrentlyActive() {
        return active;
    }

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "promotion_valid_days", joinColumns = @JoinColumn(name = "promo_id"))
    @Column(name = "day")
    @Enumerated(EnumType.STRING)
    @NonNull
    private Set<DayOfWeek> validDays = new HashSet<>();

    public boolean isValidToday() {
        if (validDays == null || validDays.isEmpty()) return true;
        return validDays.contains(LocalDate.now().getDayOfWeek());
    }

    public abstract void apply(Order order);
    public abstract PromotionDTO toDTO();
}
