package ar.uba.fi.ingsoft1.product_example.Promotions;

import ar.uba.fi.ingsoft1.product_example.Orders.Order;
import ar.uba.fi.ingsoft1.product_example.Products.ProductDTO;
import ar.uba.fi.ingsoft1.product_example.Combos.ComboDTO;
import ar.uba.fi.ingsoft1.product_example.Products.Product;
import ar.uba.fi.ingsoft1.product_example.Combos.Combo;

import jakarta.persistence.*;
import java.math.BigDecimal;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.EqualsAndHashCode;

import java.util.Set;
import java.util.HashSet;
import java.util.stream.Collectors;
import java.time.DayOfWeek;

@Entity
@Table(name = "buy_give_free_promo")
@Data
@EqualsAndHashCode(callSuper = false)
public class BuyGiveFreePromotion extends Promotion {

    @ManyToMany
    @JoinTable(name = "buy_give_free_products")
    private Set<Product> freeProducts = new HashSet<>();

    @ManyToMany
    @JoinTable(name = "buy_give_free_combos")
    private Set<Combo> freeCombos = new HashSet<>();

    private boolean oneFreePerTrigger;

    @Override
    public void apply(Order order) {
        if (!isCurrentlyActive() || !isValidToday()) return;

        long triggerCount = order.getDetails().stream()
            .filter(d ->
                (d.getProduct() != null && getProducts().contains(d.getProduct())) ||
                (d.getCombo() != null && getCombos().contains(d.getCombo()))
            )
            .mapToLong(d -> d.getQuantity())
            .sum();

        if (triggerCount == 0) return;

        long freebies = oneFreePerTrigger ? triggerCount : 1;

        for (var detail : order.getDetails()) {
            boolean isFreebie =
                (detail.getProduct() != null && freeProducts.contains(detail.getProduct())) ||
                (detail.getCombo() != null && freeCombos.contains(detail.getCombo()));

            if (isFreebie) {
                long discountUnits = Math.min(detail.getQuantity(), freebies);
                BigDecimal unitPrice = detail.getPrice();
                BigDecimal discount = unitPrice.multiply(BigDecimal.valueOf(discountUnits));
                detail.setDiscount(detail.getDiscount().add(discount));
                detail.calculateTotal();
                freebies -= discountUnits;
                if (freebies <= 0) break;
            }
        }

        order.calculateTotal();
    }

    @Override
    public BuyGiveFreePromotionDTO toDTO() {
        Set<ProductDTO> triggerProducts_ = 
            this.getProducts() != null ? this.getProducts().stream()
                .map(product -> new ProductDTO(product))
                .collect(Collectors.toSet()) : Set.of();

        Set<ComboDTO> triggerCombos_ = 
            this.getCombos() != null ? this.getCombos().stream()
                .map(combo -> new ComboDTO(combo))
                .collect(Collectors.toSet()) : Set.of();

        Set<ProductDTO> freeProducts_ =
            this.getFreeProducts() != null ? this.getFreeProducts().stream()
                .map(product -> new ProductDTO(product))
                .collect(Collectors.toSet()) : Set.of();

        Set<ComboDTO> freeCombos_ =
            this.getFreeCombos() != null ? this.getFreeCombos().stream()
                .map(combo -> new ComboDTO(combo))
                .collect(Collectors.toSet()) : Set.of();

        Set<DayOfWeek> validDays_ =
            this.getValidDays() != null ? this.getValidDays().stream()
                .collect(Collectors.toSet()) : Set.of();

        return new BuyGiveFreePromotionDTO(
            this.getId(),
            this.getName(),
            this.getDescription(),
            this.isCurrentlyActive(),
            triggerProducts_,
            triggerCombos_,
            freeProducts_,
            freeCombos_,
            validDays_,
            this.isOneFreePerTrigger()
        );
    }
}
