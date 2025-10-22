package ar.uba.fi.ingsoft1.product_example.user;

public record UserRegisterDTO(
        String nombre,
        String apellido,
        String email,
        Integer edad,
        String genero,
        String domicilio,
        String password
) {}
