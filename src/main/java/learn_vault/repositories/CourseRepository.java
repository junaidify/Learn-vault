package learn_vault.repositories;

import learn_vault.entities.CourseEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CourseRepository extends JpaRepository<CourseEntity, Long> {
    boolean existsByAuthorId(Long authorId);
    boolean existsByTitle(String title);
    List<CourseEntity> findByAuthorId(Long authorId);
    List<CourseEntity> finAll();
    Optional<CourseEntity> findById(Long id);
}
