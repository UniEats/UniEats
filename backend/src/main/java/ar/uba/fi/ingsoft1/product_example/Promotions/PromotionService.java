package ar.uba.fi.ingsoft1.product_example.Promotions;

import ar.uba.fi.ingsoft1.product_example.Combos.Combo;
import ar.uba.fi.ingsoft1.product_example.Combos.ComboRepository;
import ar.uba.fi.ingsoft1.product_example.Products.Product;
import ar.uba.fi.ingsoft1.product_example.Products.ProductRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.stream.Collectors;

import java.util.List;
import java.util.Set;
import java.util.HashSet;
import java.util.Optional;
import java.time.DayOfWeek;
import java.time.LocalDate;

@Service
@Transactional
@RequiredArgsConstructor
public class PromotionService {
    private final PromotionRepository promotionRepository;
    private final ProductRepository productRepository;
    private final ComboRepository comboRepository;

    public List<PromotionDTO> getAllPromotions() {
        return promotionRepository.findAll()
                .stream()
                .map(Promotion::toDTO)
                .toList();
    }

    @Transactional
    public List<PromotionDTO> getPromotionsDTOActiveNow() {
        DayOfWeek today = DayOfWeek.from(LocalDate.now());
        return promotionRepository.findActivePromotions(today).stream()
                .map(Promotion::toDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<Promotion> getPromotionsActiveNow() {
        DayOfWeek today = DayOfWeek.from(LocalDate.now());
        return promotionRepository.findActivePromotions(today);
    }

    public Optional<PromotionDTO> getPromotionById(Long id) {
        return promotionRepository.findById(id)
                .map(Promotion::toDTO);
    }

    @Transactional
    public Optional<PromotionDTO> createPromotion(PromotionCreateDTO dto) {
        Promotion promotion = dto.toEntity(this);
        Promotion saved = promotionRepository.save(promotion);
        return Optional.of(saved.toDTO());
    }

    @Transactional
    public Optional<PromotionDTO> updatePromotion(Long id, PromotionUpdateDTO dto) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Promotion not found with id: " + id));

        dto.applyTo(promotion, this);

        Promotion saved = promotionRepository.save(promotion);
        return Optional.of(saved.toDTO());
    }

    @Transactional
    public Optional<PromotionDTO> togglePromotionActive(Long id) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Promotion not found with id: " + id));

        promotion.setActive(!promotion.isActive());
        promotion = promotionRepository.save(promotion);
        return Optional.of(promotion.toDTO());
    }

    public boolean deletePromotion(Long id) {
        if (!promotionRepository.existsById(id)) {
            return false;
        }
        promotionRepository.deleteById(id);
        return true;
    }

    public Set<Product> findProducts(Set<Long> ids) {
        if (ids == null || ids.isEmpty()) return new HashSet<>();

        List<Product> products = productRepository.findAllById(ids);

        if (products.size() != ids.size()) {
            Set<Long> foundIds = products.stream().map(Product::getId).collect(Collectors.toSet());
            Set<Long> missingIds = ids.stream()
                                    .filter(id -> !foundIds.contains(id))
                                    .collect(Collectors.toSet());
            throw new EntityNotFoundException("Products not found with ids: " + missingIds);
        }

        return new HashSet<>(products);
    }

    public Set<Combo> findCombos(Set<Long> ids) {
        if (ids == null || ids.isEmpty()) return new HashSet<>();

        List<Combo> combos = comboRepository.findAllById(ids);

        if (combos.size() != ids.size()) {
            Set<Long> foundIds = combos.stream().map(Combo::getId).collect(Collectors.toSet());
            Set<Long> missingIds = ids.stream()
                                    .filter(id -> !foundIds.contains(id))
                                    .collect(Collectors.toSet());
            throw new EntityNotFoundException("Combos not found with ids: " + missingIds);
        }

        return new HashSet<>(combos);
    }
}
