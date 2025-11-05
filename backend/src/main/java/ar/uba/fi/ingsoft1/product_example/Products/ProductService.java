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
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.stream.Collectors;

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

        List<Tag> tags = dto.tagIds().stream()
            .map(tagId -> tagRepository.findById(tagId)
                .orElseThrow(() -> new EntityNotFoundException("Tag not found: " + tagId)))
            .toList();
        product.setTags(tags);

        if (dto.menuSectionIds() != null && !dto.menuSectionIds().isEmpty()) {
            List<MenuSection> sections = dto.menuSectionIds().stream()
                    .map(sectionId -> menuSectionRepository.findById(sectionId)
                            .orElseThrow(() -> new EntityNotFoundException("Menu section not found: " + sectionId)))
                    .toList();
            product.setMenuSections(sections);
            sections.forEach(section -> section.getProducts().add(product));
        }

        List<ProductIngredient> productIngredients = dto.ingredientIds().stream()
            .map(iq -> {
                Ingredient ingredient = ingredientRepository.findById(iq.ingredientId())
                    .orElseThrow(() -> new EntityNotFoundException("Ingredient not found: " + iq.ingredientId()));

                ProductIngredient pi = new ProductIngredient();
                pi.setId(new ProductIngredientId());
                pi.setProduct(product);
                pi.setIngredient(ingredient);
                pi.setQuantity(iq.quantity());

                return pi;
            })
            .toList();

        product.setProductIngredients(productIngredients);

        Product savedProduct = productRepository.save(product);

        return Optional.of(savedProduct.toDTO());
    }

    @Transactional
    public Optional<ProductDTO> updateProduct(Long id, ProductUpdateDTO dto, MultipartFile image) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Product not found with id: " + id));

        if (dto.name() != null) {
            product.setName(dto.name());
        }
        if (dto.description() != null) {
            product.setDescription(dto.description());
        }
        if (dto.price() != null) {
            product.setPrice(dto.price());
        }

        if (image != null && !image.isEmpty()) {
            if (image.getSize() > MAX_IMAGE_SIZE) {
                throw new IllegalArgumentException("Image cannot be greater than 2 MB");
            }
            try {
                product.setImage(image.getBytes());
            } catch (IOException e) {
                throw new RuntimeException("Error reading the image", e);
            }
        }

        product.getTags().clear();
        List<Tag> tags = dto.tagIds().stream()
            .map(tagId -> tagRepository.findById(tagId)
                .orElseThrow(() -> new EntityNotFoundException("Tag not found: " + tagId)))
            .collect(Collectors.toList());
        product.setTags(tags);

        
        for (MenuSection section : new ArrayList<>(product.getMenuSections())) {
            section.getProducts().remove(product);
        }
        product.getMenuSections().clear();
        List<MenuSection> sections = dto.menuSectionIds().stream()
                    .map(sectionId -> menuSectionRepository.findById(sectionId)
                            .orElseThrow(() -> new EntityNotFoundException("Menu section not found: " + sectionId)))
                    .collect(Collectors.toList());
            product.setMenuSections(sections);
            sections.forEach(section -> section.getProducts().add(product));

        
        product.getProductIngredients().clear();
        List<ProductIngredient> productIngredients = dto.ingredientIds().stream()
            .map(iq -> {
                Ingredient ingredient = ingredientRepository.findById(iq.ingredientId())
                    .orElseThrow(() -> new EntityNotFoundException("Ingredient not found: " + iq.ingredientId()));

                ProductIngredient pi = new ProductIngredient();
                pi.setId(new ProductIngredientId(product.getId(), iq.ingredientId()));
                pi.setProduct(product);
                pi.setIngredient(ingredient);
                pi.setQuantity(iq.quantity());

                return pi;
            })
            .collect(Collectors.toList());
        product.getProductIngredients().addAll(productIngredients);


        Product savedProduct = productRepository.save(product);

        return Optional.of(savedProduct.toDTO());
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
