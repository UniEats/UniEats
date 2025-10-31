package ar.uba.fi.ingsoft1.product_example.Orders;

import ar.uba.fi.ingsoft1.product_example.OrderDetails.OrderDetail;
import ar.uba.fi.ingsoft1.product_example.OrderDetails.OrderDetailDTO;

import jakarta.persistence.*;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.DecimalMin;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Data;
import lombok.NonNull;

import java.time.LocalDateTime;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Entity
@Table(name = "order")
@Data
@NoArgsConstructor
@AllArgsConstructor
@RequiredArgsConstructor
public class Order {
    @Id
    @GeneratedValue
    private Long id;

    @NonNull
    private Long userId;

    @NonNull
    private LocalDateTime creationDate;

    @NonNull @Digits(integer = 10, fraction = 2)
    @DecimalMin("0.00")
    private BigDecimal totalPrice;

    public void setTotalPrice(BigDecimal price) {
        this.totalPrice = price.setScale(2, RoundingMode.HALF_UP);
    }

    @ManyToOne
    @JoinColumn(name = "state_id")
    private OrderStatus state;

    @OneToMany(mappedBy = "order", cascade = CascadeType.PERSIST, orphanRemoval = true)
    private List<OrderDetail> details = new ArrayList<>();

    public void addDetail(OrderDetail detail) {
        detail.setOrder(this);
        details.add(detail);
    }

    public void calculateTotal() {
        this.totalPrice = details.stream()
                .map(OrderDetail::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public OrderDTO toDTO() {
        List<OrderDetailDTO> detailDTOs = details.stream()
                .map(OrderDetail::toDTO)
                .collect(Collectors.toList());

        return new OrderDTO(
                this.getId(),
                this.getUserId(),
                this.getCreationDate(),
                this.getTotalPrice(),
                this.getState().getId(),
                detailDTOs
        );
    }
}

