package learn_vault.repositories;

import learn_vault.entities.AuthorEntity;
import learn_vault.entities.CourseEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CourseRepository extends JpaRepository<CourseEntity, Long> {
    boolean existsByAuthor_AuthorId(Long authorId);
    boolean existsByTitle(String title);
    List<CourseEntity> findByAuthor_AuthorId(Long authorId);
    List<CourseEntity> findAll();
    Optional<CourseEntity> findById(Long id);
}
