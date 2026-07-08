package learn_vault.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import learn_vault.dto.request.LoginDto;
import learn_vault.dto.request.SignupDto;
import learn_vault.enums.Role;
import learn_vault.exception.GlobalExceptionHandler;
import learn_vault.security.JwtFilters;
import learn_vault.security.JwtUtils;
import learn_vault.security.Oauth2SuccessHandler;
import learn_vault.security.SecurityConfig;
import learn_vault.service.CustomUserDetailsService;
import learn_vault.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = {LoginController.class, UserController.class})
@Import({GlobalExceptionHandler.class, SecurityConfig.class, JwtFilters.class})
class LoginControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    @MockBean UserService userService;
    @MockBean JwtUtils jwtUtils;
    @MockBean CustomUserDetailsService customUserDetailsService;
    @MockBean AuthenticationProvider authenticationProvider;
    @MockBean Oauth2SuccessHandler oauth2SuccessHandler;

    // ── Login ────────────────────────────────────────────────────────

    @Test
    void login_shouldSetCookieAndReturn200_onValidCredentials() throws Exception {
        when(userService.userLogin(any())).thenReturn("mock-jwt-token");

        LoginDto dto = new LoginDto();
        dto.setEmail("test@example.com");
        dto.setPassword("Password1");

        mockMvc.perform(post("/api/v1/auth/login")
                        .with(csrf())
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

        mockMvc.perform(post("/api/v1/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void login_shouldReturn400_whenPasswordMissing() throws Exception {
        LoginDto dto = new LoginDto();
        dto.setEmail("test@example.com");

        mockMvc.perform(post("/api/v1/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest());
    }

    // ── Logout ───────────────────────────────────────────────────────

    @Test
    void logout_shouldExpireCookieAndReturn200() throws Exception {
        mockMvc.perform(post("/api/v1/auth/logout")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(cookie().maxAge("jwt", 0));
    }

    // ── Signup ───────────────────────────────────────────────────────

    @Test
    void signup_shouldReturn200_onSuccess() throws Exception {
        when(userService.userSignUp(any())).thenReturn("new-jwt-token");

        SignupDto dto = new SignupDto();
        dto.setName("Test User");
        dto.setUsername("testuser1");
        dto.setEmail("test@example.com");
        dto.setPassword("Password1");
        dto.setRole(Role.STUDENT);

        mockMvc.perform(post("/api/v1/auth/signup")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(cookie().exists("jwt"));
    }

    @Test
    void signup_shouldReturn400_whenNameMissing() throws Exception {
        SignupDto dto = new SignupDto();
        dto.setUsername("testuser1");
        dto.setEmail("test@example.com");
        dto.setPassword("Password1");
        dto.setRole(Role.STUDENT);

        mockMvc.perform(post("/api/v1/auth/signup")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest());
    }
}
