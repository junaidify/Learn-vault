package learn_vault.entity.user;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import learn_vault.entity.BaseEntity;
import learn_vault.entity.course.CourseEntity;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Entity
@Table(name = "author")
@Getter
@Setter
public class AuthorEntity extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private UserEntity user;

    @OneToMany(mappedBy = "author", fetch = FetchType.LAZY)
    private List<CourseEntity> courses;

    protected AuthorEntity() {}

    public AuthorEntity(UserEntity user) {
        this.user = user;
    }
}
