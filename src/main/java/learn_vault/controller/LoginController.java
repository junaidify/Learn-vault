package learn_vault.controller;

import jakarta.validation.Valid;
import learn_vault.dto.LoginDto;
import learn_vault.entities.UserEntity;
import learn_vault.repositories.UserRepository;
import learn_vault.service.UserService;
import learn_vault.utils.JwtUtils;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Date;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
public class LoginController {
    private final UserService userService;

    public LoginController(UserService userService, JwtUtils jwtUtils){
        this.userService = userService;
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@Valid @RequestBody LoginDto dto){
        String token = userService.userLogin(dto);

        ResponseCookie cookies = ResponseCookie.from("jwt", token)
                .httpOnly(true)
                .path("/")
                .maxAge( 60 * 60 * 48)
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookies.toString())
                .body("User login successfully");

    }
}
