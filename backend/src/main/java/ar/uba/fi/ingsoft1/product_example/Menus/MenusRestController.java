package ar.uba.fi.ingsoft1.product_example.Menus;

import ar.uba.fi.ingsoft1.product_example.MenuSection.MenuSectionDTO;
import ar.uba.fi.ingsoft1.product_example.MenuSection.MenuSectionService;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/menus")
@Validated
@RequiredArgsConstructor
@Tag(name = "Menus")
class MenuRestController {
    private final MenuSectionService menuSectionService;

    @GetMapping
    public List<MenuSectionDTO> getAllMenuSections() {
        return menuSectionService.getAllMenuSections();
    }
}
