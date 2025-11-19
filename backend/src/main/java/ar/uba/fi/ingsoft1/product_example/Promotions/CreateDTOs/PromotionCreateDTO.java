package ar.uba.fi.ingsoft1.product_example.Promotions;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import java.util.Set;
import java.time.DayOfWeek;

@JsonTypeInfo(
    use = JsonTypeInfo.Id.NAME,
    property = "type",
    visible = true
)
@JsonSubTypes({
    @JsonSubTypes.Type(value = ThresholdPromotionCreateDTO.class, name = "threshold"),
    @JsonSubTypes.Type(value = PercentagePromotionCreateDTO.class, name = "percentage"),
    @JsonSubTypes.Type(value = BuyXPayYPromotionCreateDTO.class, name = "buyxpayy"),
    @JsonSubTypes.Type(value = BuyGiveFreePromotionCreateDTO.class, name = "buygivefree")
})
public abstract class PromotionCreateDTO {
    private String name;
    private String description;
    private boolean active;
    private Set<Long> productIds;
    private Set<Long> comboIds;
    private Set<DayOfWeek> validDays;

    public PromotionCreateDTO(String name, String description, boolean active,
                              Set<Long> productIds, Set<Long> comboIds,
                              Set<DayOfWeek> validDays) {
        this.name = name;
        this.description = description;
        this.active = active;
        this.productIds = productIds;
        this.comboIds = comboIds;
        this.validDays = validDays;
    }

    public String getName() { return name; }
    public String getDescription() { return description; }
    public boolean isActive() { return active; }
    public Set<Long> getProductIds() { return productIds; }
    public Set<Long> getComboIds() { return comboIds; }
    public Set<DayOfWeek> getValidDays() { return validDays; }

    public abstract Promotion toEntity(PromotionService promotionService);
}
