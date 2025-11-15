package ar.uba.fi.ingsoft1.product_example.Promotions;

import ar.uba.fi.ingsoft1.product_example.config.security.JwtService;
import ar.uba.fi.ingsoft1.product_example.config.security.SecurityConfig;
import ar.uba.fi.ingsoft1.product_example.user.UserRepository;
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
import java.util.Set;

import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PromotionRestController.class)
@Import(SecurityConfig.class)
class PromotionRestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PromotionService promotionService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private UserRepository userRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private PromotionDTO promotionDTO;
    private PromotionDTO percentagePromotion;
    private PromotionDTO thresholdPromotion;
    private PromotionDTO buyxpayyPromotion;

    @BeforeEach
    void setUp() {
        promotionDTO = new PercentagePromotionDTO(
                1L,
                "Promo 10%",
                "Descuento del 10%",
                true,
                Set.of(),
                Set.of(),
                new BigDecimal("10.00"),
                Set.of()
        );

        percentagePromotion = new PercentagePromotionDTO(
                2L, "Promo 10%", "Descuento del 10%", true,
                Set.of(), Set.of(), new BigDecimal("10.00"), Set.of()
        );

        thresholdPromotion = new ThresholdPromotionDTO(
                3L, "Promo $1000", "Descuento por superar 1000", true,
                Set.of(), Set.of(), new BigDecimal("1000.00"), new BigDecimal("100.00"),
                Set.of()
        );

        buyxpayyPromotion = new BuyXPayYPromotionDTO(
                4L, "Promo 3x2", "Llevás 3, pagás 2", true,
                Set.of(), Set.of(), 3, 2, Set.of()
        );
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void getAllPromotions_returnsList() throws Exception {
        Mockito.when(promotionService.getAllPromotions()).thenReturn(List.of(promotionDTO));

        mockMvc.perform(get("/promotions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id", is(1)))
                .andExpect(jsonPath("$[0].name", is("Promo 10%")));
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void getActivePromotions_returnsList() throws Exception {
        Mockito.when(promotionService.getPromotionsDTOActiveNow()).thenReturn(List.of(promotionDTO));

        mockMvc.perform(get("/promotions/active"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id", is(1)))
                .andExpect(jsonPath("$[0].active", is(true)));
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void getPromotionById_found() throws Exception {
        Mockito.when(promotionService.getPromotionById(1L)).thenReturn(Optional.of(promotionDTO));

        mockMvc.perform(get("/promotions/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.name", is("Promo 10%")));
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void getPromotionById_notFound() throws Exception {
        Mockito.when(promotionService.getPromotionById(999L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/promotions/999"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void createPromotion_success() throws Exception {
        PromotionCreateDTO dto = new PercentagePromotionCreateDTO(
                "Promo 10%",
                "Descuento del 10%",
                true,
                Set.of(1L, 2L),
                Set.of(),
                new BigDecimal("10.00"),
                Set.of()
        );

        String json = objectMapper.writeValueAsString(dto);

        Mockito.when(promotionService.createPromotion(Mockito.any()))
                .thenReturn(Optional.of(promotionDTO));

        mockMvc.perform(post("/promotions")
                        .content(json)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.name", is("Promo 10%")));
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void createPromotion_fail_returns400() throws Exception {
        PromotionCreateDTO dto = new PercentagePromotionCreateDTO(
                "Promo inválida",
                "No se puede crear",
                false,
                Set.of(),
                Set.of(),
                new BigDecimal("0.00"),
                Set.of()
        );

        String json = objectMapper.writeValueAsString(dto);

        Mockito.when(promotionService.createPromotion(Mockito.any()))
                .thenReturn(Optional.empty());

        mockMvc.perform(post("/promotions")
                        .content(json)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void updatePromotion_success() throws Exception {
        PromotionUpdateDTO dto = new PercentagePromotionUpdateDTO(
                "Promo Actualizada",
                "Nuevo desc",
                true,
                Set.of(),
                Set.of(),
                new BigDecimal("15.00"),
                Set.of()
        );

        String json = objectMapper.writeValueAsString(dto);

        Mockito.when(promotionService.updatePromotion(Mockito.eq(1L), Mockito.any()))
                .thenReturn(Optional.of(promotionDTO));

        mockMvc.perform(patch("/promotions/1")
                        .content(json)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.name", is("Promo 10%")));
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void updatePromotion_notFound() throws Exception {
        PromotionUpdateDTO dto = new PercentagePromotionUpdateDTO(
                "Promo No Existe",
                "Desc",
                false,
                Set.of(),
                Set.of(),
                new BigDecimal("5.00"),
                Set.of()
        );

        String json = objectMapper.writeValueAsString(dto);

        Mockito.when(promotionService.updatePromotion(Mockito.eq(999L), Mockito.any()))
                .thenReturn(Optional.empty());

        mockMvc.perform(patch("/promotions/999")
                        .content(json)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void deletePromotion_success() throws Exception {
        Mockito.when(promotionService.deletePromotion(1L)).thenReturn(true);

        mockMvc.perform(delete("/promotions/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void deletePromotion_notFound() throws Exception {
        Mockito.when(promotionService.deletePromotion(999L)).thenReturn(false);

        mockMvc.perform(delete("/promotions/999"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void toggleActive_success() throws Exception {
        Mockito.when(promotionService.togglePromotionActive(1L))
                .thenReturn(Optional.of(promotionDTO));

        mockMvc.perform(post("/promotions/1/toggle-active"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.active", is(true)));
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void toggleActive_notFound() throws Exception {
        Mockito.when(promotionService.togglePromotionActive(999L))
                .thenReturn(Optional.empty());

        mockMvc.perform(post("/promotions/999/toggle-active"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void createPercentagePromotion_success() throws Exception {
        PromotionCreateDTO dto = new PercentagePromotionCreateDTO(
                "Promo 10%",
                "Descuento del 10%",
                true,
                Set.of(2L),
                Set.of(),
                new BigDecimal("10.00"),
                Set.of()
        );

        String json = objectMapper.writeValueAsString(dto);
        Mockito.when(promotionService.createPromotion(Mockito.any()))
                .thenReturn(Optional.of(percentagePromotion));

        mockMvc.perform(post("/promotions")
                        .content(json)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(2)))
                .andExpect(jsonPath("$.type", is("PERCENTAGE")));
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void createThresholdPromotion_success() throws Exception {
        PromotionCreateDTO dto = new ThresholdPromotionCreateDTO(
                "Promo $1000",
                "Descuento de $100 al superar $1000",
                true,
                Set.of(3L, 4L),
                Set.of(),
                new BigDecimal("1000.00"),
                new BigDecimal("100.00"),
                Set.of()
        );

        String json = objectMapper.writeValueAsString(dto);
        Mockito.when(promotionService.createPromotion(Mockito.any()))
                .thenReturn(Optional.of(thresholdPromotion));

        mockMvc.perform(post("/promotions")
                        .content(json)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(3)))
                .andExpect(jsonPath("$.type", is("THRESHOLD")));
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void createBuyXPayYPromotion_success() throws Exception {
        PromotionCreateDTO dto = new BuyXPayYPromotionCreateDTO(
                "Promo 3x2",
                "Llevás 3, pagás 2",
                true,
                Set.of(6L),
                Set.of(),
                3,
                2,
                Set.of()
        );

        String json = objectMapper.writeValueAsString(dto);
        Mockito.when(promotionService.createPromotion(Mockito.any()))
                .thenReturn(Optional.of(buyxpayyPromotion));

        mockMvc.perform(post("/promotions")
                        .content(json)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(4)))
                .andExpect(jsonPath("$.type", is("BUYX_PAYY")));
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void updatePercentagePromotion_success() throws Exception {
        PromotionUpdateDTO dto = new PercentagePromotionUpdateDTO(
                "Promo 15%",
                "Ahora 15%",
                true,
                Set.of(2L),
                Set.of(),
                new BigDecimal("15.00"),
                Set.of()
        );

        String json = objectMapper.writeValueAsString(dto);
        Mockito.when(promotionService.updatePromotion(Mockito.eq(2L), Mockito.any()))
                .thenReturn(Optional.of(percentagePromotion));

        mockMvc.perform(patch("/promotions/2")
                        .content(json)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(2)))
                .andExpect(jsonPath("$.type", is("PERCENTAGE")));
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void updateThresholdPromotion_success() throws Exception {
        PromotionUpdateDTO dto = new ThresholdPromotionUpdateDTO(
                "Promo $2000",
                "Nuevo umbral",
                true,
                Set.of(),
                Set.of(),
                new BigDecimal("2000.00"),
                new BigDecimal("200.00"),
                Set.of()
        );

        String json = objectMapper.writeValueAsString(dto);
        Mockito.when(promotionService.updatePromotion(Mockito.eq(3L), Mockito.any()))
                .thenReturn(Optional.of(thresholdPromotion));

        mockMvc.perform(patch("/promotions/3")
                        .content(json)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(3)))
                .andExpect(jsonPath("$.type", is("THRESHOLD")));
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void updateBuyXPayYPromotion_success() throws Exception {
        PromotionUpdateDTO dto = new BuyXPayYPromotionUpdateDTO(
                "Promo 4x3",
                "Llevás 4, pagás 3",
                true,
                Set.of(),
                Set.of(),
                4,
                3,
                Set.of()
        );

        String json = objectMapper.writeValueAsString(dto);
        Mockito.when(promotionService.updatePromotion(Mockito.eq(4L), Mockito.any()))
                .thenReturn(Optional.of(buyxpayyPromotion));

        mockMvc.perform(patch("/promotions/4")
                        .content(json)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(4)))
                .andExpect(jsonPath("$.type", is("BUYX_PAYY")));
    }
}

