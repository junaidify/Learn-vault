package learn_vault.entity.user;

import jakarta.persistence.*;
import learn_vault.entity.BaseEntity;
import lombok.Getter;
import lombok.Setter;

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

    protected AuthorEntity() {}

    public AuthorEntity(UserEntity user) {
        this.user = user;
    }
}
