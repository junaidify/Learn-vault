package learn_vault.utils;

import io.jsonwebtoken.JwtException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtUtilsTest {

    // 32-byte Base64-encoded key (256-bit)
    private static final String SECRET = "dGVzdFNlY3JldEtleUZvckp3dFRlc3RpbmdQdXJwb3Nlcw==";

    private JwtUtils jwtUtils;

    @BeforeEach
    void setUp() {
        jwtUtils = new JwtUtils(SECRET);
    }

    @Test
    void shouldGenerateAndValidateToken() {
        String token = jwtUtils.jwtGeneration("test@example.com");
        assertThat(token).isNotBlank();
        assertThat(jwtUtils.isValidToken(token)).isTrue();
    }

    @Test
    void shouldExtractEmailFromToken() {
        String email = "user@example.com";
        String token = jwtUtils.jwtGeneration(email);
        assertThat(jwtUtils.extractEmail(token)).isEqualTo(email);
    }

    @Test
    void shouldReturnFalseForTamperedToken() {
        String token = jwtUtils.jwtGeneration("user@example.com");
        String tampered = token.substring(0, token.length() - 5) + "XXXXX";
        assertThat(jwtUtils.isValidToken(tampered)).isFalse();
    }

    @Test
    void shouldThrowOnExtractFromInvalidToken() {
        assertThatThrownBy(() -> jwtUtils.extractEmail("not.a.jwt"))
                .isInstanceOf(JwtException.class);
    }
}
