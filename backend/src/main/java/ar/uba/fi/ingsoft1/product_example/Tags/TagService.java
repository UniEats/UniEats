package ar.uba.fi.ingsoft1.product_example.Tags;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
class TagService {
    private final TagRepository tagRepository;

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
            tagRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
