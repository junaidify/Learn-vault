package learn_vault.repository;

import learn_vault.entity.CourseEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CourseRepository extends JpaRepository<CourseEntity, Long> {
    List<CourseEntity> findByAuthor_AuthorId(Long authorId);
    boolean existsByTitleAndAuthor_AuthorId(String title, Long authorId);
}
