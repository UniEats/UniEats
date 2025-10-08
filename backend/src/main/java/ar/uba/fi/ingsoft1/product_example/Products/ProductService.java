package ar.uba.fi.ingsoft1.product_example.Products;

import ar.uba.fi.ingsoft1.product_example.Ingredients.Ingredient;
import ar.uba.fi.ingsoft1.product_example.Tags.Tag;
import ar.uba.fi.ingsoft1.product_example.Tags.TagRepository;

import ar.uba.fi.ingsoft1.product_example.Ingredients.IngredientRepository;
import ar.uba.fi.ingsoft1.product_example.ProductIngredient.ProductIngredient;
import ar.uba.fi.ingsoft1.product_example.ProductIngredient.ProductIngredientId;
import ar.uba.fi.ingsoft1.product_example.ProductIngredient.ProductIngredientRepository;
import ar.uba.fi.ingsoft1.product_example.MenuSections.MenuSection;
import ar.uba.fi.ingsoft1.product_example.MenuSections.MenuSectionRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
class ProductService {

    private final ProductRepository productRepository;
    private final IngredientRepository ingredientRepository;
    private final ProductIngredientRepository productIngredientRepository;
    private final TagRepository tagRepository;
    private final MenuSectionRepository menuSectionRepository;

    private static final long MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2 MB

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
    public Optional<ProductDTO> createProduct(ProductCreateDTO dto, MultipartFile image) {
        Product product = new Product(dto.name(), dto.description(), dto.price());

        List<Tag> tags = dto.tagIds().stream()
            .map(tagId -> tagRepository.findById(tagId)
                .orElseThrow(() -> new EntityNotFoundException("Tag not found: " + tagId)))
            .toList();

        product.setTags(tags);

        MultipartFile file = image;
        if (file != null && !file.isEmpty()) {
            if (file.getSize() > MAX_IMAGE_SIZE) {
                throw new IllegalArgumentException("Image cannot be greater than 2 MB");
            }
            try {
                product.setImage(file.getBytes());
            } catch (IOException e) {
                throw new RuntimeException("Error reading the image", e);
            }
        }

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

        product.setProductIngredients(productIngredients);

        if (dto.menuSectionIds() != null && !dto.menuSectionIds().isEmpty()) {
            List<MenuSection> sections = dto.menuSectionIds().stream()
                    .map(sectionId -> menuSectionRepository.findById(sectionId)
                            .orElseThrow(() -> new EntityNotFoundException("Menu section not found: " + sectionId)))
                    .toList();
            product.setMenuSections(sections);
        }

        productRepository.save(product);

        return Optional.of(product.toDTO());
    }

    public Optional<ProductDTO> updateProduct(Long id, ProductUpdateDTO update) {
        return productRepository.findById(id)
                .map(update::applyTo)
                .map(productRepository::save)
                .map(ProductDTO::new);
    }

    public boolean deleteProduct(long id) {
        if (!productRepository.existsById(id)) {
            return false;
        }
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Product not found"));

        // Quitar el producto de todas las secciones
        menuSectionRepository.findAll().forEach(section -> {
            section.getProducts().remove(product);
        });
        productRepository.delete(product);
        return true;
    }
}
