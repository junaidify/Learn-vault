package learn_vault.utils;

import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.Value;
import org.springframework.stereotype.Component;

import java.util.Base64;
import java.util.Date;
import java.security.Key;

@Component
public class JwtUtils {
    private final Key SECRET_KEY;

    public JwtUtils(@Value("${jwt.key}") String secret){
        this.SECRET_KEY = Keys.hmacShaKeyFor(Base64.getDecoder().decode(secret));
    }
    public String jwtGeneration(String email) {
        return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 48))
                .signWith(SECRET_KEY)
                .compact();
    }

    public String extractEmail(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(SECRET_KEY)
                .build()
                .parseClaimsJwt(token)
                .getBody()
                .getSubject();
    }

    public boolean isValidToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(SECRET_KEY)
                    .build()
                    .parseClaimsJws(token);

            return true;
        } catch (JwtException e) {
            return false;
        }
    }
}
