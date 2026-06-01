package learn_vault.repositories;

import learn_vault.entities.AuthorEntity;
import learn_vault.entities.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AuthorRepository extends JpaRepository<AuthorEntity, Long> {
    Optional<AuthorEntity> findByAuthorName(String authorName);
    Optional<AuthorEntity> findByUser(UserEntity user);
}
