package ar.uba.fi.ingsoft1.product_example.Ingredients;

import ar.uba.fi.ingsoft1.product_example.ProductIngredient.ProductIngredientRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class IngredientServiceTest {

    @Mock
    private IngredientRepository ingredientRepository;

    @InjectMocks
    private IngredientService ingredientService;

    @Mock
    private ProductIngredientRepository productIngredientRepository;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testGetIngredients() {
        Ingredient ingredient = new Ingredient("Tomato", "Fresh tomato", 10);
        ingredient.setId(1L);

        when(ingredientRepository.findAll()).thenReturn(List.of(ingredient));

        List<IngredientDTO> result = ingredientService.getIngredients();

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Tomato", result.get(0).name());
    }

    @Test
    void testGetIngredientById_Found() {
        Ingredient ingredient = new Ingredient("Tomato", "Fresh tomato", 10);
        ingredient.setId(1L);

        when(ingredientRepository.findById(1L)).thenReturn(Optional.of(ingredient));

        Optional<IngredientDTO> result = ingredientService.getIngredientById(1L);

        assertTrue(result.isPresent());
        assertEquals("Tomato", result.get().name());
    }

    @Test
    void testGetIngredientById_NotFound() {
        when(ingredientRepository.findById(1L)).thenReturn(Optional.empty());

        Optional<IngredientDTO> result = ingredientService.getIngredientById(1L);

        assertFalse(result.isPresent());
    }

    @Test
    void testCreateIngredient() {
        IngredientCreateDTO dto = new IngredientCreateDTO("Lettuce", "Fresh lettuce", 5);
        Ingredient ingredient = dto.asIngredient();
        ingredient.setId(1L);

        when(ingredientRepository.save(any(Ingredient.class))).thenReturn(ingredient);

        IngredientDTO result = ingredientService.createIngredient(dto);

        assertNotNull(result);
        assertEquals("Lettuce", result.name());
        assertEquals(5, result.stock());
    }

    @Test
    void testIncreaseStock_Success() {
        Ingredient ingredient = new Ingredient("Tomato", "Fresh tomato", 10);
        ingredient.setId(1L);

        when(ingredientRepository.findById(1L)).thenReturn(Optional.of(ingredient));
        when(ingredientRepository.save(any(Ingredient.class))).thenReturn(ingredient);

        Optional<IngredientDTO> result = ingredientService.increaseStock(1L, 5);

        assertTrue(result.isPresent());
        assertEquals(15, result.get().stock());
    }

    @Test
    void testIncreaseStock_NegativeAmount() {
        Ingredient ingredient = new Ingredient("Tomato", "Fresh tomato", 10);
        ingredient.setId(1L);

        when(ingredientRepository.findById(1L)).thenReturn(Optional.of(ingredient));

        Optional<IngredientDTO> result = ingredientService.increaseStock(1L, -5);

        assertFalse(result.isPresent());
    }

    @Test
    void testIncreaseStock_IngredientNotFound() {
        when(ingredientRepository.findById(1L)).thenReturn(Optional.empty());

        Optional<IngredientDTO> result = ingredientService.increaseStock(1L, 5);

        assertFalse(result.isPresent());
    }

    @Test
    void testUpdateIngredient_Success() {
        Ingredient ingredient = new Ingredient("Tomato", "Fresh", 10);
        ingredient.setId(1L);

        IngredientUpdateDTO dto = new IngredientUpdateDTO("Pepper", "Spicy pepper");

        when(ingredientRepository.findById(1L)).thenReturn(Optional.of(ingredient));
        when(ingredientRepository.save(any(Ingredient.class))).thenAnswer(inv -> inv.getArgument(0));

        Optional<IngredientDTO> result = ingredientService.updateIngredient(1L, dto);

        assertTrue(result.isPresent());
        assertEquals("Pepper", result.get().name());
        assertEquals("Spicy pepper", result.get().description());
    }

    @Test
    void testUpdateIngredient_NotFound() {
        IngredientUpdateDTO dto = new IngredientUpdateDTO("Pepper", "Spicy pepper");

        when(ingredientRepository.findById(1L)).thenReturn(Optional.empty());

        Optional<IngredientDTO> result = ingredientService.updateIngredient(1L, dto);

        assertFalse(result.isPresent());
    }

    @Test
    void testDeleteIngredient_Success() {
        when(ingredientRepository.existsById(1L)).thenReturn(true);

        doNothing().when(productIngredientRepository).deleteById_IngredientId(1L);
        doNothing().when(productIngredientRepository).flush();
        doNothing().when(ingredientRepository).deleteById(1L);
        doNothing().when(ingredientRepository).flush();

        boolean result = ingredientService.deleteIngredient(1L);

        assertTrue(result);
        verify(productIngredientRepository).deleteById_IngredientId(1L);
        verify(productIngredientRepository).flush();
        verify(ingredientRepository).deleteById(1L);
        verify(ingredientRepository).flush();
    }

    @Test
    void testDeleteIngredient_NotExists() {
        when(ingredientRepository.existsById(1L)).thenReturn(false);

        boolean result = ingredientService.deleteIngredient(1L);

        assertFalse(result);

        // No debería intentar borrar nada
        verify(productIngredientRepository, never()).deleteById_IngredientId(anyLong());
        verify(ingredientRepository, never()).deleteById(anyLong());
    }

    @Test
    void testDeleteIngredient_DataIntegrityViolation() {
        when(ingredientRepository.existsById(1L)).thenReturn(true);

        doThrow(new DataIntegrityViolationException("FK violation"))
                .when(productIngredientRepository).deleteById_IngredientId(1L);

        assertThrows(ResponseStatusException.class,
                () -> ingredientService.deleteIngredient(1L));

        verify(productIngredientRepository).deleteById_IngredientId(1L);
        verify(productIngredientRepository, never()).flush();
        verify(ingredientRepository, never()).deleteById(anyLong());
    }
}
