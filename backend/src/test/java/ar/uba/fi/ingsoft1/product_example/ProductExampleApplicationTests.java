package ar.uba.fi.ingsoft1.product_example;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.mail.javamail.JavaMailSender;

import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
class ProductExampleApplicationTests {
    @MockBean
    private JavaMailSender javaMailSender;

	@Test
	void contextLoads() {
		assertTrue(true);
	}

}
