package learn_vault.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import learn_vault.enums.Role;

@Entity
@Table(name="users",
uniqueConstraints = {
        @UniqueConstraint(columnNames = "email"),
        @UniqueConstraint(columnNames = "username")
})
public class UserEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String name;

    @NotBlank
    @Column(nullable = false, unique = true)
    private String username;

    @NotBlank
    @Email
    private String email;
    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;

    protected UserEntity(){};

    public UserEntity(String name, String username, String email, String password){
        this.name = name;
        this.username = username;
        this.email = email;
        this.password = password;
        this.role = Role.STUDENT;
    }

    public Long getId(){ return id; }
    public String getName(){ return name; }
    public String getUsername(){ return username; }
    public String getEmail(){ return email; }
    public String getPassword(){ return password; }
    public Role getRole(){return role; }

    public void setName(String name){ this.name = name; }
    public void setUsername(String username){ this.username = username; }
    public void setEmail(String email){ this.email = email; }
    public void setPassword(String hashedPassword){ this.password = hashedPassword; }
}
