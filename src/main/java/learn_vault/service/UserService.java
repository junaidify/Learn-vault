package learn_vault.service;

import learn_vault.dto.request.LoginDto;
import learn_vault.dto.request.SignupDto;
import learn_vault.entity.AuthorEntity;
import learn_vault.entity.UserEntity;
import learn_vault.enums.Role;
import learn_vault.exception.DuplicateResourceException;
import learn_vault.repository.AuthorRepository;
import learn_vault.repository.UserRepository;
import learn_vault.security.JwtUtils;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final AuthorRepository authorRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    public UserService(UserRepository userRepository,
                       AuthorRepository authorRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtils jwtUtils) {
        this.userRepository = userRepository;
        this.authorRepository = authorRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
    }

    @Transactional
    public String userSignUp(SignupDto dto) {
        if (userRepository.existsByUsernameOrEmail(dto.getUsername(), dto.getEmail())) {
            throw new DuplicateResourceException("User already exists");
        }

        Role role = dto.getRole() != null ? dto.getRole() : Role.STUDENT;

        if(dto.getRole() == null){
            throw new IllegalArgumentException("Role is required.");
        }

        UserEntity newUser = new UserEntity(
                dto.getName(),
                dto.getUsername(),
                dto.getEmail(),
                passwordEncoder.encode(dto.getPassword()),
                role
        );
        userRepository.save(newUser);

        if(role == Role.AUTHOR){
            authorRepository.save(new AuthorEntity(dto.getName(), newUser));
        }
        return jwtUtils.jwtGeneration(newUser.getEmail());
    }

    public String userLogin(LoginDto dto) {
        if (!StringUtils.hasText(dto.getEmail()) && !StringUtils.hasText(dto.getUsername())) {
            throw new BadCredentialsException("Provide username or email");
        }

        UserEntity user;
        if (StringUtils.hasText(dto.getEmail())) {
            user = userRepository.findByEmail(dto.getEmail())
                    .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));
        } else {
            user = userRepository.findByUsername(dto.getUsername())
                    .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));
        }

        if (!passwordEncoder.matches(dto.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Invalid credentials");
        }

        return jwtUtils.jwtGeneration(user.getEmail());
    }
}
