package learn_vault.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class UserRegisterDto {
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
    @Pattern(regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).*$", message = "Password should contain Alphabet, small letters and underscore.")
    private String password;

    // We don't need to defined getter and setter methods, because @Data form Lombok dependency does all by itself.

//    public String getName() { return name; }
//    public String getUsername() { return username; }
//    public String getEmail() { return email; }
//    public String getPassword() { return password; }
//
//    public void setName(String name) {
//        this.name = name;
//    }
//
//    public void setUsername(String username) {
//        this.username = username;
//    }
//
//    public void setEmail(String email) {
//        this.email = email;
//    }
//
//    public void setPassword(String password) {
//        this.password = password;
//    }
}
