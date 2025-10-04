package ar.uba.fi.ingsoft1.product_example.Products;

import ar.uba.fi.ingsoft1.product_example.Ingredients.Ingredient;
import ar.uba.fi.ingsoft1.product_example.Ingredients.IngredientRepository;
import ar.uba.fi.ingsoft1.product_example.ProductIngredient.ProductIngredient;
import ar.uba.fi.ingsoft1.product_example.ProductIngredient.ProductIngredientId;
import ar.uba.fi.ingsoft1.product_example.ProductIngredient.ProductIngredientRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
class ProductService {

    private final ProductRepository productRepository;
    private final IngredientRepository ingredientRepository;
    private final ProductIngredientRepository productIngredientRepository;

    public List<ProductDTO> geAlltProducts() {
        return productRepository.findAll()
                .stream()
                .map(ProductDTO::new)
                .toList();
    }

    public List<ProductDTO> getProductsAvailable() {
        return productRepository.findProductsWithAllIngredientsInStock()
                .stream()
                .map(ProductDTO::new)
                .toList();
    }

    public Optional<ProductDTO> getProductById(long id) {
        return productRepository.findById(id).map(ProductDTO::new);
    }

    @Transactional
    public Product createProduct(ProductCreateDTO dto) {
        Product product = new Product(dto.name(), dto.description(), dto.price());
        product = productRepository.save(product);

        Product finalProduct = product;
        List<ProductIngredient> productIngredients = dto.ingredientIds().stream()
            .map(ingredientId -> {
                Ingredient ingredient = ingredientRepository.findById(ingredientId)
                    .orElseThrow(() -> new EntityNotFoundException("Ingredient not found: " + ingredientId));
                
                ProductIngredient pi = new ProductIngredient();

                ProductIngredientId piId = new ProductIngredientId(finalProduct.getId(), ingredient.getId());
                pi.setId(piId);
                pi.setProduct(finalProduct);
                pi.setIngredient(ingredient);

                return pi;
            })
            .toList();

        productIngredientRepository.saveAll(productIngredients);
        product.setProductIngredients(productIngredients);

        return product;
    }

    public Optional<ProductDTO> updateProduct(Long id, ProductUpdateDTO update) {
        return productRepository.findById(id)
                .map(update::applyTo)
                .map(productRepository::save)
                .map(ProductDTO::new);
    }
}
