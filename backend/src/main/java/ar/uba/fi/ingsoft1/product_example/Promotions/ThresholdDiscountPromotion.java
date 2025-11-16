package ar.uba.fi.ingsoft1.product_example.Promotions;

import ar.uba.fi.ingsoft1.product_example.Orders.Order;
import ar.uba.fi.ingsoft1.product_example.Products.ProductDTO;
import ar.uba.fi.ingsoft1.product_example.Combos.ComboDTO;

import jakarta.persistence.*;
import java.math.BigDecimal;
import lombok.NonNull;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;

import java.util.Set;
import java.util.stream.Collectors;
import java.time.DayOfWeek;


@Entity
@Table(name = "threshold_discount_promo")
@Data
@NoArgsConstructor
@RequiredArgsConstructor
public class ThresholdDiscountPromotion extends Promotion {
    @NonNull
    private BigDecimal threshold;

    @NonNull
    private BigDecimal discount;

    @Override
    public void apply(Order order) {
        if (!isCurrentlyActive() || !isValidToday()) return;

        if (order.getTotalPrice().compareTo(threshold) >= 0) {
            order.setTotalPrice(order.getTotalPrice().subtract(discount));
        }
    }

    @Override
    public ThresholdPromotionDTO toDTO() {
        Set<ProductDTO> products_ = this.getProducts() != null ? this.getProducts().stream()
                                    .map(product -> new ProductDTO(product))
                                    .collect(Collectors.toSet()) : Set.of();

        Set<ComboDTO> combos_ = this.getCombos() != null ? this.getCombos().stream()
                                .map(combo -> new ComboDTO(combo))
                                .collect(Collectors.toSet()) : Set.of();
        
        Set<DayOfWeek> validDays_ = this.getValidDays() != null ? this.getValidDays().stream()
                                .collect(Collectors.toSet()) : Set.of();

        return new ThresholdPromotionDTO(
                this.getId(),
                this.getName(),
                this.getDescription(),
                this.isCurrentlyActive(),
                products_,
                combos_,
                this.getThreshold(),
                this.getDiscount(),
                validDays_
        );
    }
}
