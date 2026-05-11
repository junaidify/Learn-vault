package learn_vault.service;

import learn_vault.dto.UserRegisterDto;
import learn_vault.entities.UserEntity;
import learn_vault.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    public String userRegister(UserRegisterDto dto){
        if(userRepository.existsByEmail(dto.getEmail())){
            return "Email already exists";
        }

        if(userRepository.existsByUsername(dto.getUsername())){
            return "Username already taken.";
        }

        UserEntity newUser = new UserEntity(
                dto.getName(),
                dto.getUsername(),
                dto.getEmail(),
                dto.getPassword()
        );

        userRepository.save(newUser);
        return "User registered successfully.";

    }


}
