package ar.uba.fi.ingsoft1.product_example.common.exception;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

class ItemNotFoundExceptionTest {

    @Test
    void testExceptionMessageFormatting() {
        String entityName = "Product";
        Long entityId = 100L;

        ItemNotFoundException exception = new ItemNotFoundException(
            entityName,
            entityId
        );

        assertEquals(
            "Failed to find Product with id 100",
            exception.getMessage()
        );
    }
}
