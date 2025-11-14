package ar.uba.fi.ingsoft1.product_example.Promotions;

import ar.uba.fi.ingsoft1.product_example.Products.ProductDTO;
import ar.uba.fi.ingsoft1.product_example.Combos.ComboDTO;
import java.util.List;
import java.util.Set;
import java.time.DayOfWeek;

public abstract class PromotionDTO {
    private Long id;
    private String name;
    private String description;
    private boolean active;
    private String type;
    private Set<ProductDTO> products;
    private Set<ComboDTO> combos;
    private Set<DayOfWeek> validDays;

    public PromotionDTO(Long id, String name, String description, boolean active, String type,
                        Set<ProductDTO> products, Set<ComboDTO> combos, Set<DayOfWeek> validDays) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.active = active;
        this.type = type;
        this.products = products;
        this.combos = combos;
        this.validDays = validDays;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public boolean isActive() { return active; }
    public String getType() { return type; }
    public Set<ProductDTO> getProduct() { return products; }
    public Set<ComboDTO> getCombo() { return combos; }
    public Set<DayOfWeek> getValidDays() { return validDays; }
}
