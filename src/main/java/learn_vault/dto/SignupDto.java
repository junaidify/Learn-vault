package learn_vault.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class SignupDto {
    @NotBlank(message = "Name is required.")
    @Size(min= 3, max = 50,  message = "Name must be 2-50 characters.")
    private String name;

    @NotBlank(message = "Username is required")
    @Size(min=8, max=15, message = "Username must be between 8-15 characters.")
    @Pattern(regexp = "^[a-zA-Z0-9_]*$", message = "Username can contain letters, numbers and underscore.")
    private String username;

    @NotBlank(message = "Email should not empty.")
    @Email(message = "Enter proper email.")
    private String email;

    @NotBlank(message = "Password is required.")
    @Size(min=8, max=20, message = "Password must be between 8-20 characters.")
    @Pattern(regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).*$", message = "Password must contain at least one digit, one lowercase and one uppercase letter.")
    private String password;

}
