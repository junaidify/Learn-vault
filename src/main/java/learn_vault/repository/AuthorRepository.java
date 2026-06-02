package learn_vault.repository;

import learn_vault.entity.AuthorEntity;
import learn_vault.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AuthorRepository extends JpaRepository<AuthorEntity, Long> {
    Optional<AuthorEntity> findByAuthorName(String authorName);
    Optional<AuthorEntity> findByUser(UserEntity user);
}
