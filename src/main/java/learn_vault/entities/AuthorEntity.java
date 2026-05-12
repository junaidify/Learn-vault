package learn_vault.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Entity
@Table(name="author")
@Data
public class AuthorEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long authorId;

    @NotBlank(message = "Author name can't be empty.")
    private String authorName;

    protected AuthorEntity(){};

    public AuthorEntity(String authorName){
        this.authorName = authorName;
    }

}
