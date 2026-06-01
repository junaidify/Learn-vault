package learn_vault.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import learn_vault.dto.LoginDto;
import learn_vault.service.UserService;
import learn_vault.utils.AppConfig;
import learn_vault.utils.GlobalExceptionHandler;
import learn_vault.utils.JwtFilters;
import learn_vault.utils.JwtUtils;
import learn_vault.service.CustomUserDetailsService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = {LoginController.class, UserController.class})
@Import({GlobalExceptionHandler.class})
class LoginControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    @MockitoBean UserService userService;
    @MockitoBean JwtUtils jwtUtils;
    @MockitoBean JwtFilters jwtFilters;
    @MockitoBean CustomUserDetailsService customUserDetailsService;

    @Test
    void login_shouldSetCookieAndReturn200_onValidCredentials() throws Exception {
        when(userService.userLogin(any())).thenReturn("mock-jwt-token");

        LoginDto dto = new LoginDto();
        dto.setEmail("test@example.com");
        dto.setPassword("Password1");

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(cookie().exists("jwt"))
                .andExpect(cookie().httpOnly("jwt", true));
    }

    @Test
    void login_shouldReturn401_onBadCredentials() throws Exception {
        when(userService.userLogin(any())).thenThrow(new BadCredentialsException("Invalid credentials"));

        LoginDto dto = new LoginDto();
        dto.setEmail("wrong@example.com");
        dto.setPassword("WrongPass1");

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void login_shouldReturn400_whenPasswordMissing() throws Exception {
        LoginDto dto = new LoginDto();
        dto.setEmail("test@example.com");

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void logout_shouldExpireCookieAndReturn200() throws Exception {
        mockMvc.perform(post("/auth/logout"))
                .andExpect(status().isOk())
                .andExpect(cookie().maxAge("jwt", 0));
    }
}
