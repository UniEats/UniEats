package ar.uba.fi.ingsoft1.product_example.config.security;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity(debug = false)
public class SecurityConfig {

    public static final String[] PUBLIC_ENDPOINTS = { "/sessions" };
    public static final String[] PUBLIC_POST_ENDPOINTS = { "/users" };

    private final JwtAuthFilter authFilter;

    @Autowired
    SecurityConfig(JwtAuthFilter authFilter) {
        this.authFilter = authFilter;
    }

    @Bean
    AuthenticationManager authenticationManager(
        AuthenticationConfiguration config
    ) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http)
        throws Exception {
        return http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth ->
                auth
                    .requestMatchers(
                        "/error",
                        "/swagger-ui/**",
                        "/v3/api-docs/**"
                    )
                    .permitAll()
                    .requestMatchers(PUBLIC_ENDPOINTS)
                    .permitAll()
                    .requestMatchers(HttpMethod.POST, PUBLIC_POST_ENDPOINTS)
                    .permitAll()
                    .requestMatchers(HttpMethod.GET, "/menus")
                    .permitAll()
                    .requestMatchers("/products/**")
                    .hasRole("ADMIN")
                    .requestMatchers("/menu-sections/**")
                    .hasRole("ADMIN")
                    .requestMatchers("/tags/**")
                    .hasRole("ADMIN")
                    .requestMatchers("/ingredients/**")
                    .hasRole("ADMIN")
                    .requestMatchers(HttpMethod.GET, "/users/count")
                    .hasRole("ADMIN")
                    .anyRequest()
                    .denyAll()
            )
            .sessionManagement(sessionManager ->
                sessionManager.sessionCreationPolicy(
                    SessionCreationPolicy.STATELESS
                )
            )
            .addFilterBefore(
                authFilter,
                UsernamePasswordAuthenticationFilter.class
            )
            .build();
    }

    @Bean
    UrlBasedCorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("*"));
        configuration.setAllowedMethods(List.of("*"));
        configuration.setAllowedHeaders(List.of("*"));
        UrlBasedCorsConfigurationSource source =
            new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
