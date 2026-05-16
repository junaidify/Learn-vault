package learn_vault.utils;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;
import java.util.Date;
import java.security.Key;

@Component
public class JwtUtils {
   private final Key SECRET_KEY = Keys.secretKeyFor(SignatureAlgorithm.HS256);

   public String jwtGeneration(String email){
       return Jwts.builder()
               .setSubject(email)
               .setIssuedAt(new Date())
               .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 48))
               .signWith(SECRET_KEY)
               .compact();
   }
}
