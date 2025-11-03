package ar.uba.fi.ingsoft1.product_example.OrderDetails;

import ar.uba.fi.ingsoft1.product_example.config.security.JwtService;
import ar.uba.fi.ingsoft1.product_example.config.security.SecurityConfig;
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
import java.util.List;
import java.util.Optional;

import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(OrderDetailRestController.class)
@Import(SecurityConfig.class)
class OrderDetailRestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private OrderDetailService orderDetailService;

    @MockBean
    private JwtService jwtService;

    @Autowired
    private ObjectMapper objectMapper;

    private OrderDetailDTO detailDTO;

    @BeforeEach
    void setUp() {
        detailDTO = new OrderDetailDTO(
                1L,
                1L,
                1L,
                null,
                2,
                new BigDecimal("120.00"),
                BigDecimal.ZERO,
                new BigDecimal("240.00")
        );
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void getDetailsByOrderId_returnsList() throws Exception {
        Mockito.when(orderDetailService.getDetailsByOrderId(1L))
                .thenReturn(List.of(detailDTO));

        mockMvc.perform(get("/order-details/order/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id", is(1)));
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void createDetail_success() throws Exception {
        OrderDetailCreateDTO dto = new OrderDetailCreateDTO(
                1L,
                null,
                2,
                new BigDecimal("120.00"),
                null
        );
        String json = objectMapper.writeValueAsString(dto);

        Mockito.when(orderDetailService.createOrderDetail(any(), eq(1L)))
                .thenReturn(Optional.of(detailDTO));

        mockMvc.perform(post("/order-details/order/1")
                        .content(json)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(1)));
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void createDetail_fail_500() throws Exception {
        OrderDetailCreateDTO dto = new OrderDetailCreateDTO(
                1L, null, 2,
                new BigDecimal("120.00"),
                null
        );
        String json = objectMapper.writeValueAsString(dto);

        Mockito.when(orderDetailService.createOrderDetail(any(), eq(1L)))
                .thenReturn(Optional.empty());

        mockMvc.perform(post("/order-details/order/1")
                        .content(json)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isInternalServerError());
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void updateDetail_success() throws Exception {
        OrderDetailUpdateDTO dto = new OrderDetailUpdateDTO(10, new BigDecimal("150.00"), new BigDecimal("10.00"));
        String json = objectMapper.writeValueAsString(dto);

        Mockito.when(orderDetailService.updateOrderDetail(eq(1L), any()))
                .thenReturn(Optional.of(detailDTO));

        mockMvc.perform(patch("/order-details/1")
                        .content(json)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(1)));
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void deleteDetail_success() throws Exception {
        Mockito.when(orderDetailService.deleteOrderDetail(1L)).thenReturn(true);

        mockMvc.perform(delete("/order-details/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void deleteDetail_notFound() throws Exception {
        Mockito.when(orderDetailService.deleteOrderDetail(999L)).thenReturn(false);

        mockMvc.perform(delete("/order-details/999"))
                .andExpect(status().isNotFound());
    }
}
