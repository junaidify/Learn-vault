package learn_vault.security;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import learn_vault.entity.user.UserEntity;
import learn_vault.enums.Role;
import learn_vault.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class Oauth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
    private final JwtUtils jwtUtils;
    private final UserRepository userRepository;

    @Value("${app.oauth2-redirect}")
    private String redirectUrl;

    @Value("${app.cookie-secure:false}")
    private boolean cookieSecure;

    public Oauth2SuccessHandler(JwtUtils jwtUtils, UserRepository userRepository) {
        this.jwtUtils = jwtUtils;
        this.userRepository = userRepository;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");

        // Provision the user on first OAuth2 login
        userRepository.findByEmail(email).orElseGet(() -> {
            String username = email.split("@")[0] + "_oauth";
            UserEntity newUser = new UserEntity(name, username, email, null, Role.STUDENT);
            return userRepository.save(newUser);
        });

        String token = jwtUtils.jwtGeneration(email);

        ResponseCookie cookie = ResponseCookie.from("jwt", token)
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/")
                .maxAge(60 * 60 * 48)
                .sameSite(cookieSecure ? "None" : "Lax")
                .build();

        response.addHeader("Set-Cookie", cookie.toString());
        response.sendRedirect(redirectUrl);
    }
}
