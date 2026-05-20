package learn_vault.service;

import learn_vault.dto.LoginDto;
import learn_vault.dto.SignupDto;
import learn_vault.entities.UserEntity;
import learn_vault.repositories.UserRepository;
import learn_vault.utils.JwtUtils;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {
    public final UserRepository userRepository;
    public final PasswordEncoder passwordEncoder;
    public final JwtUtils jwtUtils;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtils jwtUtils){
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
    }

    public String userSignUp(SignupDto dto){
        if(userRepository.existsByEmail(dto.getEmail())){
            return "Email already exists";
        }

        if(userRepository.existsByUsername(dto.getUsername())){
            return "Username already taken.";
        }

        String hashPassword = passwordEncoder.encode(dto.getPassword());

        UserEntity newUser = new UserEntity(
                dto.getName(),
                dto.getUsername(),
                dto.getEmail(),
                hashPassword
        );

        userRepository.save(newUser);
        return jwtUtils.jwtGeneration(newUser.getEmail());
    }

    public String userLogin(LoginDto dto){
        Optional<UserEntity> isExistUser = userRepository.findByUsernameOrEmail(dto.getUsername(), dto.getEmail());

        if(isExistUser.isEmpty()){
            return "User not found";
        }

        UserEntity user = isExistUser.get();

        if(!passwordEncoder.matches(dto.getPassword(), user.getPassword())){
            return "Invalid password";
        }

        return jwtUtils.jwtGeneration(user.getEmail());
    }
}
