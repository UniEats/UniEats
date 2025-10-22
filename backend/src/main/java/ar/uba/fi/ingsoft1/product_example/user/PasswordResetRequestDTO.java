package ar.uba.fi.ingsoft1.product_example.user;

public record PasswordResetRequestDTO(String email) {
}

record PasswordResetDTO(String email, String code, String newPassword) {
}