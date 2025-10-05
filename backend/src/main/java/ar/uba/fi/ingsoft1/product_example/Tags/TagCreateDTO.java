package ar.uba.fi.ingsoft1.product_example.Tags;

import lombok.NonNull;

public record TagCreateDTO(
        @NonNull String tag
) {
    public Tag asTag() {
        return new Tag(tag);
    }
}
