package ar.uba.fi.ingsoft1.product_example.Promotions;

import ar.uba.fi.ingsoft1.product_example.OrderDetails.OrderDetail;
import ar.uba.fi.ingsoft1.product_example.Orders.Order;
import ar.uba.fi.ingsoft1.product_example.Orders.OrderStatus;
import ar.uba.fi.ingsoft1.product_example.Products.Product;
import ar.uba.fi.ingsoft1.product_example.user.User;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class BuyXPayYPromotionTest {

    @Test
    void apply_ExactMultiple() {
        Product burger = product(1L, "Burger");
        BuyXPayYPromotion promotion = promotion(burger, 3, 2);

        OrderDetail detail = detail(burger, 3, new BigDecimal("10.00"));
        Order order = order(detail);

        promotion.apply(order);

        assertEquals(new BigDecimal("10.00"), detail.getDiscount());
        assertEquals(new BigDecimal("20.00"), order.getTotalPrice());
    }

    @Test
    void apply_BelowThreshold() {
        Product burger = product(1L, "Burger");
        BuyXPayYPromotion promotion = promotion(burger, 3, 2);

        OrderDetail detail = detail(burger, 2, new BigDecimal("9.00"));
        Order order = order(detail);

        BigDecimal totalBefore = order.getTotalPrice();
        promotion.apply(order);

        assertEquals(0, detail.getDiscount().compareTo(BigDecimal.ZERO));
        assertEquals(totalBefore, order.getTotalPrice());
    }

    @Test
    void apply_MixedQuantity() {
        Product burger = product(1L, "Burger");
        BuyXPayYPromotion promotion = promotion(burger, 3, 2);

        OrderDetail detail = detail(burger, 7, new BigDecimal("8.00"));
        Order order = order(detail);

        promotion.apply(order);

        assertEquals(new BigDecimal("16.00"), detail.getDiscount());
        assertEquals(new BigDecimal("40.00"), order.getTotalPrice());
    }

    private BuyXPayYPromotion promotion(Product product, int buy, int pay) {
        BuyXPayYPromotion promotion = new BuyXPayYPromotion();
        promotion.setName("Buy X Pay Y");
        promotion.setDescription("Test promo");
        promotion.setActive(true);
        promotion.setProducts(Set.of(product));
        promotion.setBuyQuantity(buy);
        promotion.setPayQuantity(pay);
        promotion.setValidDays(Set.of(LocalDate.now().getDayOfWeek()));
        return promotion;
    }

    private Product product(Long id, String name) {
        Product product = new Product(name, "desc", new BigDecimal("10.00"));
        product.setId(id);
        return product;
    }

    private OrderDetail detail(Product product, int quantity, BigDecimal price) {
        OrderDetail detail = new OrderDetail();
        detail.setProduct(product);
        detail.setQuantity(quantity);
        detail.setPrice(price);
        detail.setDiscount(BigDecimal.ZERO);
        detail.calculateTotal();
        return detail;
    }

    private Order order(OrderDetail detail) {
        Order order = new Order();
        order.setCreationDate(LocalDateTime.now());
        order.setState(new OrderStatus(1L, "confirmed"));
        order.setUser(new User());
        List<OrderDetail> details = new ArrayList<>();
        detail.setOrder(order);
        details.add(detail);
        order.setDetails(details);
        order.calculateTotal();
        return order;
    }
}
