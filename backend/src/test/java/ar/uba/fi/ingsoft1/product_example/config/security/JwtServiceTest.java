package ar.uba.fi.ingsoft1.product_example.config.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import javax.crypto.SecretKey;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private static final String SECRET = "MDEyMzQ1Njc4OUFCQ0RFRjAxMjM0NTY3ODlBQkNERUY=";

    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService(SECRET, 60000L);
    }

    @Test
    void createToken_ShouldIncludeSubjectAndRole() {
        JwtUserDetails user = new JwtUserDetails("alice", "ADMIN");

        String token = jwtService.createToken(user);
        Claims claims = parseClaims(token);

        assertEquals("alice", claims.getSubject());
        assertEquals("ADMIN", claims.get("role"));
    }

    @Test
    void extractVerifiedUserDetails_ValidToken() {
        JwtUserDetails user = new JwtUserDetails("bob", "USER");
        String token = jwtService.createToken(user);

        var details = jwtService.extractVerifiedUserDetails(token);

        assertTrue(details.isPresent());
        assertEquals("bob", details.get().username());
        assertEquals("USER", details.get().role());
    }

    @Test
    void extractVerifiedUserDetails_ExpiredToken_ShouldThrow() {
        JwtService expiredService = new JwtService(SECRET, -1000L);
        String token = expiredService.createToken(new JwtUserDetails("eve", "ADMIN"));

        assertThrows(ResponseStatusException.class, () -> expiredService.extractVerifiedUserDetails(token));
    }

    @Test
    void extractVerifiedUserDetails_GarbageToken_ShouldThrow() {
        assertThrows(ResponseStatusException.class, () -> jwtService.extractVerifiedUserDetails("abc.def.ghi"));
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(signingKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private SecretKey signingKey() {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(SECRET));
    }
}
