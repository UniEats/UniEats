package ar.uba.fi.ingsoft1.product_example.MenuSections;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
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
@RequestMapping("/menu-sections")
@Validated
@RequiredArgsConstructor
@Tag(name = "Menu_sections")
class MenuSectionRestController {
    private final MenuSectionService menuSectionsService;

    @GetMapping
    public List<MenuSectionDTO> getAllMenuSections() {
        return menuSectionsService.getAllMenuSections();
    }

    @GetMapping("/{id}")
    public ResponseEntity<MenuSectionDTO> getMenuSectionById(@PathVariable long id) {
        return menuSectionsService.getMenuSectionById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<MenuSectionDTO> createMenuSection(
            @NonNull @RequestBody MenuSectionCreateDTO data
    ) {
        return menuSectionsService.createMenuSection(data)
            .map(ResponseEntity::ok)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.INTERNAL_SERVER_ERROR, "Menu section could not be created"
        ));
    }

    @PostMapping("/{menuSectionId}/products")
    public ResponseEntity<MenuSectionDTO> addProductsToMenuSection(
        @PathVariable Long menuSectionId,
        @RequestBody MenuSectionAddProductsDTO productsId
    ) {
        return menuSectionsService.addProductsToMenuSection(menuSectionId, productsId.productsId())
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }
}
