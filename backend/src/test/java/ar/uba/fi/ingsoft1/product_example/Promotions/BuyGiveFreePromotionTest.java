package ar.uba.fi.ingsoft1.product_example.Promotions;

import ar.uba.fi.ingsoft1.product_example.OrderDetails.OrderDetail;
import ar.uba.fi.ingsoft1.product_example.Orders.Order;
import ar.uba.fi.ingsoft1.product_example.Orders.OrderStatus;
import ar.uba.fi.ingsoft1.product_example.Products.Product;
import ar.uba.fi.ingsoft1.product_example.user.User;
import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class BuyGiveFreePromotionTest {

    @Test
    void apply_WhenInactive_ShouldDoNothing() {
        Product trigger = product(1L, "Burger");
        Product free = product(2L, "Fries");

        BuyGiveFreePromotion promotion = basePromotion(trigger, free);
        promotion.setActive(false);

        OrderDetail triggerDetail = detail(trigger, 4, new BigDecimal("12.00"));
        OrderDetail freeDetail = detail(free, 2, new BigDecimal("5.00"));
        Order order = order(triggerDetail, freeDetail);

        BigDecimal totalBefore = order.getTotalPrice();

        promotion.apply(order);

        assertEquals(totalBefore, order.getTotalPrice());
        assertEquals(0, freeDetail.getDiscount().compareTo(BigDecimal.ZERO));
    }

    @Test
    void apply_WhenInvalidDay_ShouldDoNothing() {
        Product trigger = product(1L, "Burger");
        Product free = product(2L, "Fries");

        BuyGiveFreePromotion promotion = basePromotion(trigger, free);
        DayOfWeek today = LocalDate.now().getDayOfWeek();
        DayOfWeek invalidDay = today.plus(1);
        promotion.setValidDays(EnumSet.of(invalidDay));

        Order order = order(detail(trigger, 4, new BigDecimal("10.00")),
                detail(free, 4, new BigDecimal("4.00")));

        BigDecimal totalBefore = order.getTotalPrice();
        promotion.apply(order);

        assertEquals(totalBefore, order.getTotalPrice());
        assertEquals(0, order.getDetails().get(1).getDiscount().compareTo(BigDecimal.ZERO));
    }

    @Test
    void apply_OneFreePerTrigger_False() {
        Product trigger = product(1L, "Burger");
        Product free = product(2L, "Fries");

        BuyGiveFreePromotion promotion = basePromotion(trigger, free);
        promotion.setOneFreePerTrigger(false);

        OrderDetail triggerDetail = detail(trigger, 4, new BigDecimal("10.00"));
        OrderDetail freeDetail = detail(free, 5, new BigDecimal("5.00"));
        Order order = order(triggerDetail, freeDetail);

        promotion.apply(order);

        assertEquals(new BigDecimal("5.00"), freeDetail.getDiscount());
        assertEquals(new BigDecimal("60.00"), order.getTotalPrice());
    }

    @Test
    void apply_OneFreePerTrigger_True() {
        Product trigger = product(1L, "Burger");
        Product free = product(2L, "Fries");

        BuyGiveFreePromotion promotion = basePromotion(trigger, free);
        promotion.setOneFreePerTrigger(true);

        OrderDetail triggerDetail = detail(trigger, 4, new BigDecimal("11.00"));
        OrderDetail freeDetail = detail(free, 6, new BigDecimal("4.00"));
        Order order = order(triggerDetail, freeDetail);

        promotion.apply(order);

        assertEquals(new BigDecimal("16.00"), freeDetail.getDiscount());
        assertEquals(new BigDecimal("52.00"), order.getTotalPrice());
    }

    @Test
    void apply_NoTriggers_ShouldDoNothing() {
        Product trigger = product(1L, "Burger");
        Product free = product(2L, "Fries");

        BuyGiveFreePromotion promotion = basePromotion(trigger, free);
        promotion.setProducts(Set.of());

        OrderDetail otherDetail = detail(product(9L, "Other"), 3, new BigDecimal("8.00"));
        OrderDetail freeDetail = detail(free, 2, new BigDecimal("3.50"));
        Order order = order(otherDetail, freeDetail);

        BigDecimal totalBefore = order.getTotalPrice();
        promotion.apply(order);

        assertEquals(totalBefore, order.getTotalPrice());
        assertEquals(0, freeDetail.getDiscount().compareTo(BigDecimal.ZERO));
    }

    private BuyGiveFreePromotion basePromotion(Product trigger, Product freeProduct) {
        BuyGiveFreePromotion promotion = new BuyGiveFreePromotion();
        promotion.setName("Buy X, Get Y");
        promotion.setDescription("Test promo");
        promotion.setActive(true);
        promotion.setProducts(Set.of(trigger));
        promotion.setFreeProducts(Set.of(freeProduct));
        promotion.setValidDays(EnumSet.of(LocalDate.now().getDayOfWeek()));
        promotion.setOneFreePerTrigger(true);
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

    private Order order(OrderDetail... details) {
        Order order = new Order();
        order.setCreationDate(LocalDateTime.now());
        order.setState(new OrderStatus(1L, "confirmed"));
        order.setUser(new User());
        List<OrderDetail> detailList = new ArrayList<>();
        for (OrderDetail detail : details) {
            detail.setOrder(order);
            detailList.add(detail);
        }
        order.setDetails(detailList);
        order.calculateTotal();
        return order;
    }
}
