package ar.uba.fi.ingsoft1.product_example.Orders;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.NonNull;

@Entity
@Table(name = "order_status")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderStatus {

    @Id
    @GeneratedValue
    private Long id;

    @NonNull
    private String name;
}