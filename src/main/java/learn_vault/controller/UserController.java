package learn_vault.controller;

import jakarta.validation.Valid;
import learn_vault.dto.request.SignupDto;
import learn_vault.service.UserService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth/v1")
public class UserController {
    private final UserService userService;

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
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookies.toString())
                .body("User registered successfully.");
    }
}
