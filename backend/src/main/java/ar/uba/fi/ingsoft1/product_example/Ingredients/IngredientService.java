package ar.uba.fi.ingsoft1.product_example.Ingredients;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
class IngredientService {
    private final IngredientRepository ingredientRepository;
    private final ar.uba.fi.ingsoft1.product_example.ProductIngredient.ProductIngredientRepository productIngredientRepository;

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

    public Optional<IngredientDTO> updateIngredient(long id, IngredientUpdateDTO data) {
        return ingredientRepository.findById(id)
                .map(ingredient -> {
                    ingredient.setName(data.name());
                    ingredient.setDescription(data.description());
                    return new IngredientDTO(ingredientRepository.save(ingredient));
                });
    }

    public boolean deleteIngredient(long id) {
        if (ingredientRepository.existsById(id)) {
            try {
                // First remove any ProductIngredient references to this ingredient
                productIngredientRepository.deleteById_IngredientId(id);
                // flush deletions to DB to ensure FK constraints are evaluated here
                productIngredientRepository.flush();

                ingredientRepository.deleteById(id);
                ingredientRepository.flush();
                return true;
            } catch (DataIntegrityViolationException e) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Ingredient is in use and cannot be deleted");
            }
        }
        return false;
    }

    @Transactional
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
