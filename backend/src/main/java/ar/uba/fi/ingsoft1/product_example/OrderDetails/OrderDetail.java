package ar.uba.fi.ingsoft1.product_example.OrderDetails;

import ar.uba.fi.ingsoft1.product_example.Orders.Order;

import jakarta.persistence.*;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.DecimalMin;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Data;
import lombok.NonNull;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Entity
@Table(name = "order_details")
@Data
@NoArgsConstructor
@AllArgsConstructor
@RequiredArgsConstructor
public class OrderDetail {

    @Id
    @GeneratedValue
    private Long id;

    private Long productId;
    private Long comboId;

    @NonNull
    private Integer quantity;

    @NonNull @Digits(integer = 10, fraction = 2)
    @DecimalMin("0.00")
    private BigDecimal price;

    public void setPrice(BigDecimal price) {
        this.price = price.setScale(2, RoundingMode.HALF_UP);
    }

    @NonNull @Digits(integer = 10, fraction = 2)
    @DecimalMin("0.00")
    private BigDecimal discount;

    public void setDiscount(BigDecimal discount) {
        this.discount = discount.setScale(2, RoundingMode.HALF_UP);
    }

    @NonNull @Digits(integer = 10, fraction = 2)
    @DecimalMin("0.00")
    private BigDecimal totalPrice;

    public void setTotalPrice(BigDecimal price) {
        this.totalPrice = price.setScale(2, RoundingMode.HALF_UP);
    }

    public void calculateTotal() {
        this.totalPrice = price.multiply(BigDecimal.valueOf(quantity))
                .subtract(discount)
                .setScale(2, RoundingMode.HALF_UP);
    }

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private Order order;

    public OrderDetailDTO toDTO() {
        return new OrderDetailDTO(
                this.getId(),
                this.getOrder().getId(),
                this.getProductId() != null ? this.getProductId() : null,
                this.getComboId() != null ? this.getComboId() : null,
                this.getQuantity(),
                this.getPrice(),
                this.getDiscount(),
                this.getTotalPrice()
        );
    }


}
