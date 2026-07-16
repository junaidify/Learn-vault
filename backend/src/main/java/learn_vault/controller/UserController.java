package learn_vault.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import learn_vault.dto.request.SignupDto;
import learn_vault.service.UserService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class UserController {
    private final UserService userService;

    @Value("${app.cookie-secure:false}")
    private boolean cookieSecure;

    public UserController(UserService userService){
        this.userService = userService;
    }
    @PostMapping("/signup")
    public ResponseEntity<String> userRegister(@Valid @RequestBody SignupDto dto){
         String token = userService.userSignUp(dto);

        ResponseCookie cookies = ResponseCookie.from("jwt", token)
                .httpOnly(true)
                .path("/")
                .maxAge(60 * 60 * 48)
                .sameSite(cookieSecure ? "None" : "Lax")
                .secure(cookieSecure)
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookies.toString())
                .body("User registered successfully.");
    }
}
