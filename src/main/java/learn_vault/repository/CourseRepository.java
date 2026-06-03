package learn_vault.repository;

import learn_vault.entity.course.CourseEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.domain.Pageable;
import java.util.List;

public interface CourseRepository extends JpaRepository<CourseEntity, Long> {
    List<CourseEntity> findByAuthor_AuthorId(Long authorId);
    boolean existsByTitleAndAuthor_AuthorId(String title, Long authorId);
    Page<CourseEntity> findAll(Pageable pageable);
}
