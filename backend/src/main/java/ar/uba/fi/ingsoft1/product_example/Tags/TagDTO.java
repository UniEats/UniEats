package ar.uba.fi.ingsoft1.product_example.Tags;

public record TagDTO(
        long id,
        String tag
) {
    public TagDTO(Tag tag) {
        this(tag.getId(), tag.getTag());
    }

}
