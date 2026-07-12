package learn_vault.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {
    private final JwtFilters jwtFilters;
    private final AuthenticationProvider authenticationProvider;
    private final Oauth2SuccessHandler oauth2SuccessHandler;

    public SecurityConfig(JwtFilters jwtFilters,
                          AuthenticationProvider authenticationProvider,
                          Oauth2SuccessHandler oauth2SuccessHandler) {
        this.jwtFilters = jwtFilters;
        this.authenticationProvider = authenticationProvider;
        this.oauth2SuccessHandler = oauth2SuccessHandler;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/login/oauth2/code/**", "/oauth2/**").permitAll()
                        .requestMatchers("/api/v1/auth/**").permitAll()
                        .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/v1/author/**").hasAnyRole("ADMIN", "AUTHOR")
                        .requestMatchers("/api/chat/**").permitAll()
                        // Public read access — anyone can browse courses
                        .requestMatchers(HttpMethod.GET, "/api/v1/courses", "/api/v1/courses/**").permitAll()
                        // Write operations require AUTHOR or ADMIN
                        .requestMatchers(HttpMethod.POST, "/api/v1/courses/**").hasAnyRole("ADMIN", "AUTHOR")
                        .requestMatchers(HttpMethod.PATCH, "/api/v1/courses/**").hasAnyRole("ADMIN", "AUTHOR")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/courses/**").hasAnyRole("ADMIN", "AUTHOR")
                        // Payment endpoints — any authenticated user can pay
                        .requestMatchers("/api/v1/payment/**").authenticated()
                        .anyRequest().authenticated()
                )
                .oauth2Login(oauth -> oauth.successHandler(oauth2SuccessHandler))
                .authenticationProvider(authenticationProvider)
                .addFilterBefore(jwtFilters, UsernamePasswordAuthenticationFilter.class)
                .build();
    }
}
