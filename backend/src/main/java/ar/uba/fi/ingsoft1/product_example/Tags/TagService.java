package ar.uba.fi.ingsoft1.product_example.Tags;

import ar.uba.fi.ingsoft1.product_example.Products.Product;
import ar.uba.fi.ingsoft1.product_example.Products.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
class TagService {
    private final TagRepository tagRepository;
    private final ProductRepository productRepository;

    public List<TagDTO> getTags() {
        return tagRepository.findAll().stream()
                .map(TagDTO::new)
                .toList();
    }

    public Optional<TagDTO> getTagById(long id) {
        return tagRepository.findById(id).map(TagDTO::new);
    }

    public TagDTO createTag(TagCreateDTO data) {
        var tag = data.asTag();
        return new TagDTO(tagRepository.save(tag));
    }

    public Optional<TagDTO> updateTag(long id, TagCreateDTO data) {
        return tagRepository.findById(id)
                .map(tag -> {
                    tag.setTag(data.tag());
                    return new TagDTO(tagRepository.save(tag));
                });
    }

    public boolean deleteTag(long id) {
        if (tagRepository.existsById(id)) {
            try {
                // First, remove the association from any products that reference this tag
                List<Product> products = productRepository.findByTags_Id(id);
                if (products != null && !products.isEmpty()) {
                    for (Product p : products) {
                        p.getTags().removeIf(t -> t.getId().equals(id));
                        productRepository.save(p);
                    }
                    // ensure changes are flushed so FK constraints are updated
                    productRepository.flush();
                }

                tagRepository.deleteById(id);
                tagRepository.flush();
                return true;
            } catch (DataIntegrityViolationException e) {
                // Tag is still referenced by other entities (e.g. products) -> return conflict
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Tag is in use and cannot be deleted");
            }
        }
        return false;
    }
}
