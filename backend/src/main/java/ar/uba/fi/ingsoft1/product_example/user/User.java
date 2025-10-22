package ar.uba.fi.ingsoft1.product_example.user;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import lombok.NoArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;


@Entity(name = "users")
@NoArgsConstructor
@Getter
@Setter
public class User implements UserDetails, UserCredentials {

    @Id
    @GeneratedValue
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String role;

    private String nombre;
    private String apellido;
    private Integer edad;
    private String genero;
    private String domicilio;

    @Column(nullable = false)
    private boolean verified = false;

    @Column(name = "foto", columnDefinition = "BYTEA")
    private byte[] foto;

    @Column
    private String verificationCode;

    public User(String username, String password, String role) {
        this.username = username;
        this.password = password;
        this.role = role;
    }

    public String getEmail() { return this.username; }

    public void setEmail(String email) { this.username = email; }

    public void setDomicilio(String domicilio) { this.domicilio = domicilio; }

    public void setEdad(Integer edad) { this.edad = edad; }

    public void setGenero(String genero) { this.genero = genero; }


    @Override
    public String username() {
        return this.username;
    }

    @Override
    public String password() {
        return this.password;
    }

    @Override
    public String getUsername() {
        return this.username;
    }

    @Override
    public String getPassword() {
        return this.password;
    }

    public String getRole() {
        return role;
    }

    public String getNombre() { return nombre; }

    public String getApellido() { return apellido; }

    public byte[] getFoto() { return foto; }

    public Integer getEdad() { return edad; }

    public String getGenero() { return genero; }

    public String getDomicilio() { return domicilio; }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return verified;
    }


    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(role));
    }
}
