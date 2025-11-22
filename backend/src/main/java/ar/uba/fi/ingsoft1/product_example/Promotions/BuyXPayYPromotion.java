package ar.uba.fi.ingsoft1.product_example.Promotions;

import ar.uba.fi.ingsoft1.product_example.Orders.Order;
import ar.uba.fi.ingsoft1.product_example.Products.ProductDTO;
import ar.uba.fi.ingsoft1.product_example.Combos.ComboDTO;

import jakarta.persistence.*;
import java.math.BigDecimal;
import lombok.Data;
import lombok.RequiredArgsConstructor;

import java.util.Set;
import java.util.stream.Collectors;
import java.time.DayOfWeek;


@Entity
@Table(name = "buy_x_pay_y_promo")
@Data
@RequiredArgsConstructor
public class BuyXPayYPromotion extends Promotion {
    private int buyQuantity;
    private int payQuantity;

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
                int quantity = detail.getQuantity();
                int groups = quantity / buyQuantity;
                int freeUnits = groups * (buyQuantity - payQuantity);
                BigDecimal prevDiscount = detail.getDiscount();
                if (freeUnits > 0) {
                    BigDecimal unitPrice = detail.getPrice();
                    BigDecimal discount = unitPrice.multiply(BigDecimal.valueOf(freeUnits));
                    detail.setDiscount(prevDiscount.add(discount));
                    detail.calculateTotal();
                }
            }
        }
    }

    @Override
    public BuyXPayYPromotionDTO toDTO() {
        Set<ProductDTO> products_ = this.getProducts() != null ? this.getProducts().stream()
                                    .map(product -> new ProductDTO(product))
                                    .collect(Collectors.toSet()) : Set.of();

        Set<ComboDTO> combos_ = this.getCombos() != null ? this.getCombos().stream()
                                .map(combo -> new ComboDTO(combo))
                                .collect(Collectors.toSet()) : Set.of();

        Set<DayOfWeek> validDays_ = this.getValidDays() != null ? this.getValidDays().stream()
                                .collect(Collectors.toSet()) : Set.of();

        return new BuyXPayYPromotionDTO(
                this.getId(),
                this.getName(),
                this.getDescription(),
                this.isCurrentlyActive(),
                products_,
                combos_,
                this.getBuyQuantity(),
                this.getPayQuantity(),
                validDays_
        );
    }
}
