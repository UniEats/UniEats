package ar.uba.fi.ingsoft1.product_example.MenuSections;

import ar.uba.fi.ingsoft1.product_example.Products.Product;
import ar.uba.fi.ingsoft1.product_example.Products.ProductRepository;
import ar.uba.fi.ingsoft1.product_example.Combos.Combo;
import ar.uba.fi.ingsoft1.product_example.Combos.ComboRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
public class MenuSectionService {

    private final MenuSectionRepository menuSectionRepository;
    private final ProductRepository productRepository;
    private final ComboRepository comboRepository;

    public List<MenuSectionDTO> getAllMenuSections() {
        return menuSectionRepository.findAll()
                .stream()
                .map(MenuSectionDTO::new)
                .toList();
    }

    public Optional<MenuSectionDTO> getMenuSectionById(long id) {
        return menuSectionRepository.findById(id).map(MenuSectionDTO::new);
    }

    public Optional<MenuSectionDTO> createMenuSection(MenuSectionCreateDTO dto) {
        return Optional.of(new MenuSectionDTO(menuSectionRepository.save(dto.asMenuSection())));
    }

    public Optional<MenuSectionDTO> updateMenuSection(long id, MenuSectionCreateDTO dto) {
        return menuSectionRepository.findById(id)
                .map(section -> {
                    section.setLabel(dto.label());
                    section.setDescription(dto.description());
                    return new MenuSectionDTO(menuSectionRepository.save(section));
                });
    }

    public boolean deleteMenuSection(long id) {
        if (menuSectionRepository.existsById(id)) {
            menuSectionRepository.deleteById(id);
            return true;
        }
        return false;
    }

    @Transactional
    public Optional<MenuSectionDTO> addProductsToMenuSection(Long menuSectionId, List<Long> productIds) {
        Optional<MenuSection> menuSectionOpt = menuSectionRepository.findById(menuSectionId);
        if (menuSectionOpt.isEmpty()) {
            return Optional.empty();
        }

        MenuSection menuSection = menuSectionOpt.get();

        List<Product> productsToAdd = productRepository.findAllById(productIds);

        List<Product> existingProducts = menuSection.getProducts();

        for (Product p : productsToAdd) {
            if (!existingProducts.contains(p)) {
                existingProducts.add(p);
            }
        }

        menuSection.setProducts(existingProducts);
        menuSectionRepository.save(menuSection);

        return Optional.of(new MenuSectionDTO(menuSection));
    }

    @Transactional
    public Optional<MenuSectionDTO> addCombosToMenuSection(Long menuSectionId, List<Long> comboIds) {
        Optional<MenuSection> menuSectionOpt = menuSectionRepository.findById(menuSectionId);
        if (menuSectionOpt.isEmpty()) {
            return Optional.empty();
        }

        MenuSection menuSection = menuSectionOpt.get();

        List<Combo> combosToAdd = comboRepository.findAllById(comboIds);

        List<Combo> existingCombos = menuSection.getCombos();

        for (Combo c : combosToAdd) {
            if (!existingCombos.contains(c)) {
                existingCombos.add(c);
            }
        }

        menuSection.setCombos(existingCombos);
        menuSectionRepository.save(menuSection);

        return Optional.of(new MenuSectionDTO(menuSection));
    }
}   
