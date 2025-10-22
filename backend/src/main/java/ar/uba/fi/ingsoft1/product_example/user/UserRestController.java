package ar.uba.fi.ingsoft1.product_example.user;

import io.swagger.v3.oas.annotations.Operation;
import ar.uba.fi.ingsoft1.product_example.common.EmailService;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.fasterxml.jackson.core.JsonProcessingException;
import org.springframework.http.MediaType;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.JsonProcessingException;
import java.io.IOException;

import java.util.Optional;
import java.util.UUID;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/users")
@Tag(name = "1 - Users")
class UserRestController {

    private final UserService userService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Autowired
    UserRestController(UserService userService,
                       UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       EmailService emailService) {
        this.userService = userService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    // --- Endpoint original (sign-up genérico)
    @PostMapping(produces = "application/json")
    @Operation(summary = "Create a new user")
    @ResponseStatus(HttpStatus.CREATED)
    @ApiResponse(responseCode = "409", description = "User already exists", content = @Content)
    ResponseEntity<TokenDTO> signUp(
            @Valid @NonNull @RequestBody UserCreateDTO data
    ) throws MethodArgumentNotValidException {
        return userService.createUser(data)
                .map(tk -> ResponseEntity.status(HttpStatus.CREATED).body(tk))
                .orElse(ResponseEntity.status(HttpStatus.CONFLICT).build());
    }

    @PostMapping(value = "/register", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Register a new user and send verification code")
    public ResponseEntity<?> register(
            @RequestPart("user") String userJson,
            @RequestPart(value = "photo", required = false) MultipartFile photo
    ) throws JsonProcessingException {
        ObjectMapper mapper = new ObjectMapper();
        UserRegisterDTO data = mapper.readValue(userJson, UserRegisterDTO.class);

        if (userRepository.findByUsername(data.email()).isPresent()) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "El email ya está registrado");
            return ResponseEntity.badRequest().body(response);
        }

        String verificationCode = UUID.randomUUID().toString().substring(0, 6);

        User newUser = new User();
        newUser.setEmail(data.email());
        newUser.setPassword(passwordEncoder.encode(data.password()));
        newUser.setRole("ROLE_USER");
        newUser.setNombre(data.nombre());
        newUser.setApellido(data.apellido());
        newUser.setEdad(data.edad());
        newUser.setGenero(data.genero());
        newUser.setDomicilio(data.domicilio());
        newUser.setVerificationCode(verificationCode);
        newUser.setVerified(false);

        if (photo != null && !photo.isEmpty()) {
            try {
                newUser.setFoto(photo.getBytes());
            } catch (IOException e) {
                throw new RuntimeException("Error uploading the image.", e);
            }
        }

        userRepository.save(newUser);
        emailService.sendVerificationEmail(data.email(), verificationCode);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Código de verificación enviado a " + data.email());
        return ResponseEntity.ok(response);
    }

    // --- Endpoint de testeo (solo GET, sin lógica real)
    @GetMapping("/register")
    @Operation(summary = "Test endpoint for user registration (no action performed)")
    public ResponseEntity<String> testRegisterEndpoint() {
        return ResponseEntity.ok("✅ Endpoint /users/register operativo");
    }


    @PostMapping("/verify")
    @Operation(summary = "Verify a user's email using a verification code")
    public ResponseEntity<?> verifyEmail(@RequestBody VerifyRequest request) {
        Optional<User> optionalUser = userRepository.findByUsername(request.email());
        if (optionalUser.isEmpty()) {
            return ResponseEntity.badRequest().body("Usuario no encontrado");
        }

        Map<String, String> response = new HashMap<>();
        User user = optionalUser.get();
        if (user.getVerificationCode().equals(request.code())) {
            user.setVerified(true);
            user.setVerificationCode(null);
            userRepository.save(user);
            response.put("message", "Correo verificado con éxito");
            return ResponseEntity.ok(response);
        } else {
            response.put("message", "Código incorrecto");
            return ResponseEntity.badRequest().body(response);
        }
    }


    @GetMapping(path = "/count", produces = "application/json")
    @Operation(summary = "Get total registered users")
    UserCountDTO getUserCount() {
        return new UserCountDTO(userService.getUserCount());
    }
}
