package ar.uba.fi.ingsoft1.product_example.Promotions;

import ar.uba.fi.ingsoft1.product_example.Orders.Order;
import ar.uba.fi.ingsoft1.product_example.Orders.OrderStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Set;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class ThresholdPromotionTest {

    @Test
    void apply_BelowThreshold_ShouldLeaveTotal() {
        ThresholdDiscountPromotion promotion = promotion(new BigDecimal("100.00"), new BigDecimal("15.00"));
        Order order = order(new BigDecimal("80.00"));

        promotion.apply(order);

        assertEquals(new BigDecimal("80.00"), order.getTotalPrice());
    }

    @Test
    void apply_AboveThreshold_ShouldApplyDiscount() {
        ThresholdDiscountPromotion promotion = promotion(new BigDecimal("100.00"), new BigDecimal("15.50"));
        Order order = order(new BigDecimal("125.00"));

        promotion.apply(order);

        assertEquals(new BigDecimal("109.50"), order.getTotalPrice());
    }

    private ThresholdDiscountPromotion promotion(BigDecimal threshold, BigDecimal discount) {
        ThresholdDiscountPromotion promotion = new ThresholdDiscountPromotion();
        promotion.setName("Threshold");
        promotion.setDescription("threshold discount");
        promotion.setActive(true);
        promotion.setThreshold(threshold);
        promotion.setDiscount(discount);
        promotion.setValidDays(Set.of(LocalDate.now().getDayOfWeek()));
        return promotion;
    }

    private Order order(BigDecimal total) {
        Order order = new Order();
        order.setCreationDate(LocalDateTime.now());
        order.setState(new OrderStatus(1L, "confirmed"));
        order.setTotalPrice(total);
        order.setDetails(new ArrayList<>());
        return order;
    }
}
