package ar.uba.fi.ingsoft1.product_example.Orders;

import ar.uba.fi.ingsoft1.product_example.config.security.JwtService;
import ar.uba.fi.ingsoft1.product_example.config.security.SecurityConfig;
import ar.uba.fi.ingsoft1.product_example.OrderDetails.OrderDetailCreateDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;

@WebMvcTest(OrderRestController.class)
@Import({SecurityConfig.class})
class OrderRestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private OrderService orderService;

    @MockBean
    private JwtService jwtService;

    @Autowired
    private ObjectMapper objectMapper;

    private OrderDTO orderDTO;

    @BeforeEach
    void setUp() {
        orderDTO = new OrderDTO(
                1L,                    
                1L,                   
                LocalDateTime.now(),
                new BigDecimal("500.00"),
                10L,                   
                List.of()         
        );
    }

    private OrderDetailCreateDTO createDetail() {
        return new OrderDetailCreateDTO(
                1L,    
                null,
                1,
                new BigDecimal("500.00"),
                null
        );
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void getAllOrders_returnsList() throws Exception {
        Mockito.when(orderService.geAlltOrders()).thenReturn(List.of(orderDTO));

        mockMvc.perform(get("/orders"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id", is(1)));
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void getOrderById_found() throws Exception {
        Mockito.when(orderService.getOrderById(1L)).thenReturn(Optional.of(orderDTO));

        mockMvc.perform(get("/orders/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(1)));
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void getOrderById_notFound() throws Exception {
        Mockito.when(orderService.getOrderById(999L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/orders/999"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void createOrder_success() throws Exception {
        OrderCreateDTO dto = new OrderCreateDTO(List.of(createDetail()));
        String json = objectMapper.writeValueAsString(dto);

        Mockito.when(orderService.createOrder(any(), eq(1L)))
                .thenReturn(Optional.of(orderDTO));

        mockMvc.perform(post("/orders")
                        .content(json)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(1)));
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void createOrder_fail_returns500() throws Exception {
        OrderCreateDTO dto = new OrderCreateDTO(List.of(createDetail()));
        String json = objectMapper.writeValueAsString(dto);

        Mockito.when(orderService.createOrder(any(), eq(1L)))
                .thenReturn(Optional.empty());

        mockMvc.perform(post("/orders")
                        .content(json)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isInternalServerError());
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void updateOrder_success() throws Exception {
        OrderUpdateDTO dto = new OrderUpdateDTO(new BigDecimal("600.00"));
        String json = objectMapper.writeValueAsString(dto);

        Mockito.when(orderService.updateOrder(eq(1L), any()))
                .thenReturn(Optional.of(orderDTO));

        mockMvc.perform(patch("/orders/1")
                        .content(json)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(1)));
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void deleteOrder_success() throws Exception {
        Mockito.when(orderService.deleteOrder(1L)).thenReturn(true);

        mockMvc.perform(delete("/orders/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void deleteOrder_notFound() throws Exception {
        Mockito.when(orderService.deleteOrder(999L)).thenReturn(false);

        mockMvc.perform(delete("/orders/999"))
                .andExpect(status().isNotFound());
    }

        @Test
    @WithMockUser(roles = {"ADMIN"})
    void getConfirmedOrders_returnsList() throws Exception {
        Mockito.when(orderService.getConfirmedOrders())
                .thenReturn(List.of(orderDTO));

        mockMvc.perform(get("/orders/confirmed"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id", is(1)));
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void getOrdersWithAllMenuItemsInStock_returnsList() throws Exception {
        Mockito.when(orderService.getOrdersWithAllMenuItemsInStock())
                .thenReturn(List.of(orderDTO));

        mockMvc.perform(get("/orders/all-menu-items-in-stock"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id", is(1)));
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void updateOrder_notFound() throws Exception {
        OrderUpdateDTO dto = new OrderUpdateDTO(new BigDecimal("600.00"));
        String json = objectMapper.writeValueAsString(dto);

        Mockito.when(orderService.updateOrder(eq(999L), any()))
                .thenReturn(Optional.empty());

        mockMvc.perform(patch("/orders/999")
                        .content(json)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void startPreparation_success() throws Exception {
        Mockito.when(orderService.startPreparation(1L))
                .thenReturn(Optional.of(orderDTO));

        mockMvc.perform(post("/orders/1/start-preparation"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(1)));
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void startPreparation_notFound() throws Exception {
        Mockito.when(orderService.startPreparation(999L))
                .thenReturn(Optional.empty());

        mockMvc.perform(post("/orders/999/start-preparation"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void markReady_success() throws Exception {
        Mockito.when(orderService.markReady(1L))
                .thenReturn(Optional.of(orderDTO));

        mockMvc.perform(post("/orders/1/mark-ready"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(1)));
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void markReady_notFound() throws Exception {
        Mockito.when(orderService.markReady(999L))
                .thenReturn(Optional.empty());

        mockMvc.perform(post("/orders/999/mark-ready"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void pickup_success() throws Exception {
        Mockito.when(orderService.pickup(1L))
                .thenReturn(Optional.of(orderDTO));

        mockMvc.perform(post("/orders/1/pickup"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(1)));
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void pickup_notFound() throws Exception {
        Mockito.when(orderService.pickup(999L))
                .thenReturn(Optional.empty());

        mockMvc.perform(post("/orders/999/pickup"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void cancelOrder_success() throws Exception {
        Mockito.when(orderService.cancelOrder(1L))
                .thenReturn(Optional.of(orderDTO));

        mockMvc.perform(post("/orders/1/cancel"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(1)));
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void cancelOrder_notFound() throws Exception {
        Mockito.when(orderService.cancelOrder(999L))
                .thenReturn(Optional.empty());

        mockMvc.perform(post("/orders/999/cancel"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void confirmOrder_success() throws Exception {
        Mockito.when(orderService.confirmOrder(1L))
                .thenReturn(Optional.of(orderDTO));

        mockMvc.perform(post("/orders/1/confirm"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(1)));
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void confirmOrder_notFound() throws Exception {
        Mockito.when(orderService.confirmOrder(999L))
                .thenReturn(Optional.empty());

        mockMvc.perform(post("/orders/999/confirm"))
                .andExpect(status().isNotFound());
    }
}
