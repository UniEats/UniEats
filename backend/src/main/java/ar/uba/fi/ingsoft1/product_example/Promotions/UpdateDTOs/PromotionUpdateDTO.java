package ar.uba.fi.ingsoft1.product_example.Promotions;

import java.util.List;
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
    @JsonSubTypes.Type(value = ThresholdPromotionUpdateDTO.class, name = "threshold"),
    @JsonSubTypes.Type(value = PercentagePromotionUpdateDTO.class, name = "percentage"),
    @JsonSubTypes.Type(value = BuyXPayYPromotionUpdateDTO.class, name = "buyxpayy")
})
public abstract class PromotionUpdateDTO {
    private String name;
    private String description;
    private Boolean active;
    private Set<Long> productIds;
    private Set<Long> comboIds;
    private Set<DayOfWeek> validDays;

    public PromotionUpdateDTO(String name, String description, Boolean active,
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
    public Boolean getActive() { return active; }
    public Set<Long> getProductIds() { return productIds; }
    public Set<Long> getComboIds() { return comboIds; }
    public Set<DayOfWeek> getValidDays() { return validDays; }

    public abstract void applyTo(Promotion promotion, PromotionService promotionService);
}
