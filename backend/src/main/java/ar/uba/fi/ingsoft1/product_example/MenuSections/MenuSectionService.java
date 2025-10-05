package ar.uba.fi.ingsoft1.product_example.MenuSection;

import ar.uba.fi.ingsoft1.product_example.Products.Product;
import ar.uba.fi.ingsoft1.product_example.Products.ProductRepository;

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

/*
    public List<MenuSectionDTO> getAllMenuSections() {
    return menuSectionRepository.findAll()
            .stream()
            .map(MenuSectionDTO::new)
            .collect(Collectors.toList());
    }
*/
}   
