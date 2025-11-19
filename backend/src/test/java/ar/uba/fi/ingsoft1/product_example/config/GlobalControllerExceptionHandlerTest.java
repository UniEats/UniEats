package ar.uba.fi.ingsoft1.product_example.config;

import ar.uba.fi.ingsoft1.product_example.common.exception.ItemNotFoundException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.hamcrest.Matchers;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class GlobalControllerExceptionHandlerTest {

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        LocalValidatorFactoryBean validator = new LocalValidatorFactoryBean();
        validator.afterPropertiesSet();
        mockMvc = MockMvcBuilders
                .standaloneSetup(new DummyController())
                .setControllerAdvice(new GlobalControllerExceptionHandler())
                .setValidator(validator)
                .build();
    }

    @Test
    void handleMethodArgumentNotValid_ShouldReturnBadRequest() throws Exception {
        mockMvc.perform(post("/dummy/validate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(content().string(Matchers.containsString("must not be null")));
    }

    @Test
    void handleItemNotFound_ShouldReturn404() throws Exception {
        mockMvc.perform(get("/dummy/not-found"))
                .andExpect(status().isNotFound())
                .andExpect(content().string(Matchers.containsString("Failed to find product")));
    }

    @Test
    void handleAccessDenied_ShouldReturn403() throws Exception {
        mockMvc.perform(get("/dummy/denied"))
                .andExpect(status().isForbidden())
                .andExpect(content().string(Matchers.containsString("denied")));
    }

    @RestController
    @RequestMapping("/dummy")
    static class DummyController {

        @PostMapping("/validate")
        void validate(@Valid @RequestBody DummyRequest request) {
            // Validation is handled by Spring
        }

        @GetMapping("/not-found")
        void notFound() throws ItemNotFoundException {
            throw new ItemNotFoundException("product", 1L);
        }

        @GetMapping("/denied")
        void denied() {
            throw new AccessDeniedException("denied");
        }
    }

    static record DummyRequest(@NotNull String field) {}
}
