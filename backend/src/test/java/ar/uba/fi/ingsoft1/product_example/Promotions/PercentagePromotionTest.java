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

class PercentagePromotionTest {

    @Test
    void apply_Percentage_ShouldDiscountMatchingItems() {
        Product burger = product(1L, "Burger");
        Product drink = product(2L, "Drink");

        PercentageDiscountPromotion promotion = new PercentageDiscountPromotion();
        promotion.setName("15% off");
        promotion.setDescription("test percentage");
        promotion.setActive(true);
        promotion.setValidDays(Set.of(LocalDate.now().getDayOfWeek()));
        promotion.setPercentage(new BigDecimal("15"));
        promotion.setProducts(Set.of(burger));

        OrderDetail burgerDetail = detail(burger, 2, new BigDecimal("12.00"));
        OrderDetail drinkDetail = detail(drink, 1, new BigDecimal("5.00"));
        Order order = order(burgerDetail, drinkDetail);

        promotion.apply(order);
        order.calculateTotal();

        assertEquals(new BigDecimal("3.60"), burgerDetail.getDiscount());
        assertEquals(0, drinkDetail.getDiscount().compareTo(BigDecimal.ZERO));
        assertEquals(new BigDecimal("25.40"), order.getTotalPrice());
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
        List<OrderDetail> list = new ArrayList<>();
        for (OrderDetail detail : details) {
            detail.setOrder(order);
            list.add(detail);
        }
        order.setDetails(list);
        order.calculateTotal();
        return order;
    }
}
