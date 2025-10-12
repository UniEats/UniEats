package ar.uba.fi.ingsoft1.product_example.Ingredients;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class IngredientServiceTest {

    @Mock
    private IngredientRepository ingredientRepository;

    @InjectMocks
    private IngredientService ingredientService;

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

}
