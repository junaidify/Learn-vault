package learn_vault.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

@Entity
@Table(name = "author")
@Getter
@Setter
@ToString(exclude = {"courses", "user"})
public class AuthorEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long authorId;

    @NotBlank(message = "Author name can't be empty.")
    private String authorName;

    @OneToOne
    @JoinColumn(name = "user_id")
    private UserEntity user;

    @OneToMany(mappedBy = "author", fetch = FetchType.LAZY)
    private List<CourseEntity> courses;

    protected AuthorEntity() {}

    public AuthorEntity(String authorName) {
        this.authorName = authorName;
    }

    public AuthorEntity(String authorName, UserEntity user) {
        this.authorName = authorName;
        this.user = user;
    }
}
