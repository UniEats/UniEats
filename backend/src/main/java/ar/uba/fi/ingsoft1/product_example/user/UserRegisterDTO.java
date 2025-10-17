package ar.uba.fi.ingsoft1.product_example.user;

public record UserRegisterDTO(
        String nombre,
        String apellido,
        String email,
        String foto,
        Integer edad,
        String genero,
        String domicilio,
        String password
) {}
