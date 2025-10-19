package ar.uba.fi.ingsoft1.product_example.Combos;

import ar.uba.fi.ingsoft1.product_example.Products.Product;
import ar.uba.fi.ingsoft1.product_example.Products.ProductRepository;

import ar.uba.fi.ingsoft1.product_example.ComboProduct.ComboProductRepository;
import ar.uba.fi.ingsoft1.product_example.ComboProduct.ComboProduct;
import ar.uba.fi.ingsoft1.product_example.ComboProduct.ComboProductId;
import ar.uba.fi.ingsoft1.product_example.MenuSections.MenuSection;
import ar.uba.fi.ingsoft1.product_example.MenuSections.MenuSectionRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class ComboService {

    private final ComboRepository comboRepository;
    private final ProductRepository productRepository;
    private final ComboProductRepository comboProductRepository;
    private final MenuSectionRepository menuSectionRepository;

    private static final long MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2 MB

    public List<ComboDTO> getAlltCombos() {
        return comboRepository.findAll()
                .stream()
                .map(ComboDTO::new)
                .toList();
    }

    public List<ComboDTO> getCombosAvailable() {
        return comboRepository.findCombosWithAllProductsInStock()
                .stream()
                .map(ComboDTO::new)
                .toList();
    }

    public Optional<ComboDTO> getComboById(long id) {
        return comboRepository.findById(id).map(ComboDTO::new);
    }

    @Transactional
    public Optional<ComboDTO> createCombo(ComboCreateDTO dto, MultipartFile image) {
        Combo combo = new Combo(dto.name(), dto.description(), dto.price());

        MultipartFile file = image;
        if (file != null && !file.isEmpty()) {
            if (file.getSize() > MAX_IMAGE_SIZE) {
                throw new IllegalArgumentException("Image cannot be greater than 2 MB");
            }
            try {
                combo.setImage(file.getBytes());
            } catch (IOException e) {
                throw new RuntimeException("Error reading the image", e);
            }
        }

        if (dto.menuSectionIds() != null && !dto.menuSectionIds().isEmpty()) {
            List<MenuSection> sections = dto.menuSectionIds().stream()
                    .map(sectionId -> menuSectionRepository.findById(sectionId)
                            .orElseThrow(() -> new EntityNotFoundException("Menu section not found: " + sectionId)))
                    .toList();
            combo.setMenuSections(sections);
            sections.forEach(section -> section.getCombos().add(combo));
        }

        List<ComboProduct> comboProducts = dto.productIds().stream()
                .map(pq -> {
                    Product product = productRepository.findById(pq.productId())
                            .orElseThrow(() -> new EntityNotFoundException("Product not found: " + pq.productId()));

                    ComboProduct cp = new ComboProduct();
                    cp.setId(new ComboProductId());
                    cp.setCombo(combo);
                    cp.setProduct(product);
                    cp.setQuantity(pq.quantity());

                    return cp;
                })
                .toList();

        combo.setComboProducts(comboProducts);

        Combo savedCombo = comboRepository.save(combo);

        return Optional.of(savedCombo.toDTO());
    }

    @Transactional
    public Optional<ComboDTO> updateCombo(Long id, ComboUpdateDTO dto, MultipartFile image) {
        Combo combo = comboRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Combo not found with id: " + id));

        if (dto.name() != null) {
            combo.setName(dto.name());
        }
        if (dto.description() != null) {
            combo.setDescription(dto.description());
        }
        if (dto.price() != null) {
            combo.setPrice(dto.price());
        }

        if (image != null && !image.isEmpty()) {
            if (image.getSize() > MAX_IMAGE_SIZE) {
                throw new IllegalArgumentException("Image cannot be greater than 2 MB");
            }
            try {
                combo.setImage(image.getBytes());
            } catch (IOException e) {
                throw new RuntimeException("Error reading the image", e);
            }
        }

        for (MenuSection section : new ArrayList<>(combo.getMenuSections())) {
            section.getCombos().remove(combo);
        }
        combo.getMenuSections().clear();
        List<MenuSection> sections = dto.menuSectionIds().stream()
                .map(sectionId -> menuSectionRepository.findById(sectionId)
                        .orElseThrow(() -> new EntityNotFoundException("Menu section not found: " + sectionId)))
                .collect(Collectors.toList());
        combo.setMenuSections(sections);
        sections.forEach(section -> section.getCombos().add(combo));


        combo.getComboProducts().clear();
        List<ComboProduct> comboProducts = dto.productIds().stream()
                .map(pq -> {
                    Product product = productRepository.findById(pq.productId())
                            .orElseThrow(() -> new EntityNotFoundException("Product not found: " + pq.productId()));

                    ComboProduct cp = new ComboProduct();
                    cp.setId(new ComboProductId(combo.getId(), pq.productId()));
                    cp.setCombo(combo);
                    cp.setProduct(product);
                    cp.setQuantity(pq.quantity());

                    return cp;
                })
                .collect(Collectors.toList());
        combo.getComboProducts().addAll(comboProducts);

        Combo savedCombo = comboRepository.save(combo);

        return Optional.of(savedCombo.toDTO());
    }

    public boolean deleteCombo(Long id) {
        if (!comboRepository.existsById(id)) {
            return false;
        }

        Combo combo = comboRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Combo not found"));

        menuSectionRepository.findAll().forEach(section -> {
            section.getCombos().remove(combo);
        });

        comboRepository.delete(combo);
        return true;
    }
}
