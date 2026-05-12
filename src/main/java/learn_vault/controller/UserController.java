package learn_vault.controller;

import jakarta.validation.Valid;
import learn_vault.dto.UserRegisterDto;
import learn_vault.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class UserController {
//    private final UserService userService;
//
//    public UserController(UserService userService){
//        this.userService = userService;
//    }

    // We can initilize two ways, constructor injection is mentioned above and below one is called field injection.

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public String userRegister(@Valid @RequestBody UserRegisterDto dto){
        return userService.userRegister(dto);
    }

}
