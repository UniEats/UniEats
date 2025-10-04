package ar.uba.fi.ingsoft1.product_example.Ingredients;

public record IngredientDTO(
        long id,
        String name,
        String description,
        int stock
) {
    public IngredientDTO(Ingredient ingredient) {
        this(ingredient.getId(), ingredient.getName(), ingredient.getDescription(), ingredient.getStock());
    }
}
