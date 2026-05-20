package learn_vault.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class LoginDto {
    @NotBlank(message = "Enter email")
    @Email
    private String email;

    @NotBlank(message = "Enter valid username")
    @Size(min = 8, max = 15, message = "Password must be between 8-15 characters.")
    @Pattern(regexp = "^[a-zA-Z0-9_]*$", message = "Username can contain letters, numbers and underscore.")
    private String username;

    @NotBlank(message = "Enter password")
    @Size(min=8, max = 20, message = "Password must be between 8-20 characters")
    @Pattern(regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).*$", message = "Password must contain at least one digit, one lowercase and one uppercase letter.")
    private String password;

}
