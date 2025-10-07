package ar.uba.fi.ingsoft1.product_example.Products;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.validation.annotation.Validated;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;
import com.fasterxml.jackson.core.JsonProcessingException;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/products")
@Validated
@RequiredArgsConstructor
@Tag(name = "Products")
class ProductRestController {
    private final ProductService productService;


    @GetMapping
    public List<ProductDTO> getAllProducts() {
        return productService.geAlltProducts();
    }

    @GetMapping("/all-ingredients-in-stock")
    public List<ProductDTO> getProductsWithAllIngredientsInStock() {
        return productService.getProductsAvailable();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductDTO> getProductById(@PathVariable long id) {
        return productService.getProductById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<ProductDTO> createProduct(
            @RequestPart("product") String product,
            @RequestPart(value = "image", required = true) MultipartFile image
    ) throws JsonProcessingException {
        ObjectMapper mapper = new ObjectMapper();
        ProductCreateDTO dto = mapper.readValue(product, ProductCreateDTO.class);

        return productService.createProduct(dto, image)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.INTERNAL_SERVER_ERROR, "Product could not be created"
                ));
    }

    @PatchMapping("/{id}")
    public Optional<ProductDTO> updateProduct(
            @PathVariable Long id,
            @NonNull @RequestBody ProductUpdateDTO data
    ) {
        return productService.updateProduct(id, data);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable long id) {
        boolean deleted = productService.deleteProduct(id);
        return deleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }
}
