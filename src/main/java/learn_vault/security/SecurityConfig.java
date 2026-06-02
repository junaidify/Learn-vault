package learn_vault.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
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
                        .requestMatchers("/auth/**").permitAll()
                        .requestMatchers("/admin/**").hasRole("ADMIN")
                        .requestMatchers("/author/**").hasAnyRole("ADMIN", "AUTHOR")
                        // create-course must be matched before the wildcard /course/**
                        .requestMatchers("/course/create-course").hasAnyRole("ADMIN", "AUTHOR")
                        .requestMatchers("/course/**").hasAnyRole("ADMIN", "AUTHOR", "STUDENT")
                        .anyRequest().authenticated()
                )
                .oauth2Login(oauth -> oauth.successHandler(oauth2SuccessHandler))
                .authenticationProvider(authenticationProvider)
                .addFilterBefore(jwtFilters, UsernamePasswordAuthenticationFilter.class)
                .build();
    }
}
