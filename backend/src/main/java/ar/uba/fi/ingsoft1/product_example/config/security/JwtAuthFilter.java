package ar.uba.fi.ingsoft1.product_example.config.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.server.ResponseStatusException;

import ar.uba.fi.ingsoft1.product_example.user.UserRepository;
import ar.uba.fi.ingsoft1.product_example.user.User;

import java.io.IOException;
import java.util.List;

@Component
class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Autowired
    JwtAuthFilter(JwtService jwtService, UserRepository userRepository) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        try {
            this.authenticateToken(request);
            filterChain.doFilter(request, response);
        } catch (ResponseStatusException e) {
            response.sendError(e.getStatusCode().value());
        }
    }

    private void authenticateToken(HttpServletRequest request) {
        // Is the user already authenticated?
        if (SecurityContextHolder.getContext().getAuthentication() != null) {
            return;
        }

        // Try to get the token
        String authHeader = request.getHeader("Authorization");
        String headerPrefix = "Bearer ";
        if (authHeader == null || !authHeader.startsWith(headerPrefix)) {
            return;
        }
        String token = authHeader.substring(headerPrefix.length());

        jwtService.extractVerifiedUserDetails(token).ifPresent(userDetails -> {
            userRepository.findByUsername(userDetails.username()).ifPresent(user -> {
                var authToken = new UsernamePasswordAuthenticationToken(
                        user,
                        null,
                        user.getAuthorities()
                );
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            });
        });
    }
}
