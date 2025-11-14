package ar.uba.fi.ingsoft1.product_example.Promotions;

import ar.uba.fi.ingsoft1.product_example.Orders.Order;
import ar.uba.fi.ingsoft1.product_example.Products.ProductDTO;
import ar.uba.fi.ingsoft1.product_example.Combos.ComboDTO;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.math.RoundingMode;
import lombok.NonNull;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;

import java.util.Set;
import java.util.stream.Collectors;
import java.time.DayOfWeek;


@Entity
@Table(name = "percentage_discount_promo")
@Data
@NoArgsConstructor
@RequiredArgsConstructor
public class PercentageDiscountPromotion extends Promotion {
    @NonNull
    private BigDecimal percentage;

    @Override
    public void apply(Order order) {
        if (!isCurrentlyActive() || !isValidToday()) return;

        for (var detail : order.getDetails()) {
            boolean applies =
                (detail.getProduct() != null &&
                 getProducts().stream().anyMatch(p -> p.getId().equals(detail.getProduct().getId()))) ||
                (detail.getCombo() != null &&
                 getCombos().stream().anyMatch(c -> c.getId().equals(detail.getCombo().getId())));

            if (applies) {
                BigDecimal prevDiscount = detail.getDiscount();
                BigDecimal discount = detail.getTotalPrice().multiply(percentage.divide(new BigDecimal("100"), 10, RoundingMode.HALF_UP));
                detail.setDiscount(prevDiscount.add(discount));
                detail.calculateTotal();
            }
        }

        order.calculateTotal();
    }

    @Override
    public PercentagePromotionDTO toDTO() {
        Set<ProductDTO> products_ = this.getProducts() != null ? this.getProducts().stream()
                                    .map(product -> new ProductDTO(product))
                                    .collect(Collectors.toSet()) : Set.of();

        Set<ComboDTO> combos_ = this.getCombos() != null ? this.getCombos().stream()
                                .map(combo -> new ComboDTO(combo))
                                .collect(Collectors.toSet()) : Set.of();
        
        Set<DayOfWeek> validDays_ = this.getValidDays() != null ? this.getValidDays().stream()
                                .collect(Collectors.toSet()) : Set.of();

        return new PercentagePromotionDTO(
                this.getId(),
                this.getName(),
                this.getDescription(),
                this.isCurrentlyActive(),
                products_,
                combos_,
                this.getPercentage(),
                validDays_
        );
    }
}
