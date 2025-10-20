package ar.uba.fi.ingsoft1.product_example.Tags;

import ar.uba.fi.ingsoft1.product_example.Products.Product;
import ar.uba.fi.ingsoft1.product_example.Products.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class TagServiceTest {

    @Mock
    private TagRepository tagRepository;

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private TagService tagService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testGetTags() {
        Tag tag = new Tag("Vegano");
        tag.setId(1L);

        when(tagRepository.findAll()).thenReturn(List.of(tag));

        List<TagDTO> result = tagService.getTags();

        assertEquals(1, result.size());
        assertEquals("Vegano", result.get(0).tag());
    }

    @Test
    void testGetTagById_Found() {
        Tag tag = new Tag("Sin TACC");
        tag.setId(2L);

        when(tagRepository.findById(2L)).thenReturn(Optional.of(tag));

        Optional<TagDTO> result = tagService.getTagById(2L);

        assertTrue(result.isPresent());
        assertEquals("Sin TACC", result.get().tag());
    }

    @Test
    void testGetTagById_NotFound() {
        when(tagRepository.findById(99L)).thenReturn(Optional.empty());

        Optional<TagDTO> result = tagService.getTagById(99L);

        assertFalse(result.isPresent());
    }

    @Test
    void testCreateTag() {
        TagCreateDTO dto = new TagCreateDTO("Picante");
        Tag tag = dto.asTag();
        tag.setId(3L);

        when(tagRepository.save(any(Tag.class))).thenReturn(tag);

        TagDTO result = tagService.createTag(dto);

        assertNotNull(result);
        assertEquals("Picante", result.tag());
    }

    @Test
    void testUpdateTag_Found() {
        Tag existingTag = new Tag("Sin gluten");
        existingTag.setId(4L);

        TagCreateDTO updateDTO = new TagCreateDTO("Gluten Free");

        when(tagRepository.findById(4L)).thenReturn(Optional.of(existingTag));
        when(tagRepository.save(any(Tag.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Optional<TagDTO> result = tagService.updateTag(4L, updateDTO);

        assertTrue(result.isPresent());
        assertEquals("Gluten Free", result.get().tag());
    }

    @Test
    void testUpdateTag_NotFound() {
        TagCreateDTO dto = new TagCreateDTO("Nueva tag");

        when(tagRepository.findById(999L)).thenReturn(Optional.empty());

        Optional<TagDTO> result = tagService.updateTag(999L, dto);

        assertFalse(result.isPresent());
    }

    @Test
    void testDeleteTag_TagExists_NoProducts() {
        when(tagRepository.existsById(1L)).thenReturn(true);
        when(productRepository.findByTags_Id(1L)).thenReturn(Collections.emptyList());

        boolean result = tagService.deleteTag(1L);

        verify(tagRepository).deleteById(1L);
        verify(tagRepository).flush();
        assertTrue(result);
    }

    @Test
    void testDeleteTag_TagExists_WithProducts() {
        Tag tag = new Tag("Especial");
        tag.setId(1L);

        Product product = new Product();
        product.setId(10L);
        product.setTags(new ArrayList<>(Set.of(tag)));

        when(tagRepository.existsById(1L)).thenReturn(true);
        when(productRepository.findByTags_Id(1L)).thenReturn(List.of(product));

        boolean result = tagService.deleteTag(1L);

        verify(productRepository).save(any(Product.class));
        verify(productRepository).flush();
        verify(tagRepository).deleteById(1L);
        verify(tagRepository).flush();

        assertTrue(result);
    }

    @Test
    void testDeleteTag_TagNotFound() {
        when(tagRepository.existsById(99L)).thenReturn(false);

        boolean result = tagService.deleteTag(99L);

        verify(tagRepository, never()).deleteById(any());
        assertFalse(result);
    }

    @Test
    void testDeleteTag_DataIntegrityViolation() {
        when(tagRepository.existsById(1L)).thenReturn(true);
        when(productRepository.findByTags_Id(1L)).thenReturn(Collections.emptyList());

        doThrow(DataIntegrityViolationException.class).when(tagRepository).deleteById(1L);

        assertThrows(ResponseStatusException.class, () -> tagService.deleteTag(1L));
    }
}
