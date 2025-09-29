package ar.uba.fi.ingsoft1.product_example.config.security;

public record JwtUserDetails (
        String username,
        String role
) {}