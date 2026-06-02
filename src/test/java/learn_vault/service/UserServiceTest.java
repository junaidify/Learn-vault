package learn_vault.service;

import learn_vault.dto.request.LoginDto;
import learn_vault.dto.request.SignupDto;
import learn_vault.entity.UserEntity;
import learn_vault.enums.Role;
import learn_vault.repository.AuthorRepository;
import learn_vault.repository.UserRepository;
import learn_vault.security.JwtUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock UserRepository userRepository;
    @Mock AuthorRepository authorRepository;
    @Mock PasswordEncoder passwordEncoder;
    @Mock
    JwtUtils jwtUtils;

    @InjectMocks UserService userService;

    private SignupDto signupDto;

    @BeforeEach
    void setUp() {
        signupDto = new SignupDto();
        signupDto.setName("Test User");
        signupDto.setUsername("testuser1");
        signupDto.setEmail("test@example.com");
        signupDto.setPassword("Password1");
        signupDto.setRole(Role.STUDENT);
    }

    @Test
    void signup_shouldReturnToken_whenNewUser() {
        when(userRepository.existsByUsernameOrEmail(anyString(), anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("hashed");
        when(userRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(jwtUtils.jwtGeneration(anyString())).thenReturn("jwt-token");

        String token = userService.userSignUp(signupDto);

        assertThat(token).isEqualTo("jwt-token");
        verify(userRepository).save(any(UserEntity.class));
    }

    @Test
    void signup_shouldThrow_whenUserAlreadyExists() {
        when(userRepository.existsByUsernameOrEmail(anyString(), anyString())).thenReturn(true);

        assertThatThrownBy(() -> userService.userSignUp(signupDto))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("already exists");
    }

    @Test
    void signup_shouldCreateAuthorEntity_whenRoleIsAuthor() {
        signupDto.setRole(Role.AUTHOR);
        when(userRepository.existsByUsernameOrEmail(anyString(), anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("hashed");
        when(userRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(jwtUtils.jwtGeneration(anyString())).thenReturn("jwt-token");

        userService.userSignUp(signupDto);

        verify(authorRepository).save(any());
    }

    @Test
    void login_shouldReturnToken_onValidCredentials() {
        UserEntity user = new UserEntity("Test", "testuser1", "test@example.com", "hashed", Role.STUDENT);
        LoginDto dto = new LoginDto();
        dto.setEmail("test@example.com");
        dto.setPassword("Password1");

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("Password1", "hashed")).thenReturn(true);
        when(jwtUtils.jwtGeneration("test@example.com")).thenReturn("jwt-token");

        String token = userService.userLogin(dto);
        assertThat(token).isEqualTo("jwt-token");
    }

    @Test
    void login_shouldThrow_onWrongPassword() {
        UserEntity user = new UserEntity("Test", "testuser1", "test@example.com", "hashed", Role.STUDENT);
        LoginDto dto = new LoginDto();
        dto.setEmail("test@example.com");
        dto.setPassword("WrongPass1");

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("WrongPass1", "hashed")).thenReturn(false);

        assertThatThrownBy(() -> userService.userLogin(dto))
                .isInstanceOf(BadCredentialsException.class);
    }

    @Test
    void login_shouldThrow_whenUserNotFound() {
        LoginDto dto = new LoginDto();
        dto.setEmail("unknown@example.com");
        dto.setPassword("Password1");

        when(userRepository.findByEmail("unknown@example.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.userLogin(dto))
                .isInstanceOf(BadCredentialsException.class);
    }

    @Test
    void login_shouldThrow_whenNeitherEmailNorUsernameProvided() {
        LoginDto dto = new LoginDto();
        dto.setPassword("Password1");

        assertThatThrownBy(() -> userService.userLogin(dto))
                .isInstanceOf(BadCredentialsException.class);
    }
}
