package ar.uba.fi.ingsoft1.product_example.Ingredients;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
class IngredientService {
    private final IngredientRepository ingredientRepository;

    public List<IngredientDTO> getIngredients() {
        return ingredientRepository.findAll().stream()
                .map(IngredientDTO::new)
                .toList();
    }

    public Optional<IngredientDTO> getIngredientById(long id) {
        return ingredientRepository.findById(id).map(IngredientDTO::new);
    }

    public IngredientDTO createIngredient(IngredientCreateDTO data) {
        return new IngredientDTO(ingredientRepository.save(data.asIngredient()));
    }

    public Optional<IngredientDTO> increaseStock(Long ingredientId, int amount) {
        Optional<Ingredient> ingredientOpt = ingredientRepository.findById(ingredientId);

        if (ingredientOpt.isEmpty() || amount < 0) {
            return Optional.empty();
        }

        Ingredient ingredient = ingredientOpt.get();
        int newStock = ingredient.getStock() + amount;

        ingredient.setStock(newStock);
        ingredientRepository.save(ingredient);

        return Optional.of(convertToDTO(ingredient));
    }

    private IngredientDTO convertToDTO(Ingredient ingredient) {
        return new IngredientDTO(ingredient.getId(), ingredient.getName(), ingredient.getDescription(), ingredient.getStock());
    }
}
