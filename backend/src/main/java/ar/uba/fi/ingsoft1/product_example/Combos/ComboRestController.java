package ar.uba.fi.ingsoft1.product_example.Combos;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.validation.annotation.Validated;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;
import com.fasterxml.jackson.core.JsonProcessingException;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;


@RestController
@RequestMapping("/combos")
@Validated
@RequiredArgsConstructor
@Tag(name = "Combos")
public class ComboRestController {

    private final ComboService comboService;

    @GetMapping
    public List<ComboDTO> getAllCombos() {
        return comboService.getAlltCombos();
    }

    @GetMapping("/all-products-in-stock")
    public List<ComboDTO> getCombosWithAllProductsInStock() {
        return comboService.getCombosAvailable();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ComboDTO> getComboById(@PathVariable Long id) {
        return comboService.getComboById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<ComboDTO> createCombo(
            @RequestPart("combo") String comboJson,
            @RequestPart(value = "image", required = false) MultipartFile image
    ) throws JsonProcessingException {
        ObjectMapper mapper = new ObjectMapper();
        ComboCreateDTO dto = mapper.readValue(comboJson, ComboCreateDTO.class);

        return comboService.createCombo(dto, image)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.INTERNAL_SERVER_ERROR, "Combo could not be created"
                ));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ComboDTO> updateCombo(
            @PathVariable Long id,
            @RequestPart("combo") String comboJson,
            @RequestPart(value = "image", required = false) MultipartFile image
    ) throws JsonProcessingException {
        ObjectMapper mapper = new ObjectMapper();
        ComboUpdateDTO dto = mapper.readValue(comboJson, ComboUpdateDTO.class);
        return comboService.updateCombo(id, dto, image)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Combo could not be created"));

    }


    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCombo(@PathVariable Long id) {
        boolean deleted = comboService.deleteCombo(id);
        return deleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }
}