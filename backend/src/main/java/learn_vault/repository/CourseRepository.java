package learn_vault.repository;

import learn_vault.entity.course.CourseEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.domain.Pageable;
import java.util.List;

public interface CourseRepository extends JpaRepository<CourseEntity, Long> {
    List<CourseEntity> findByAuthor_Id(Long authorId);
    boolean existsByNameAndAuthor_Id(String name, Long authorId);
    Page<CourseEntity> findAll(Pageable pageable);
    boolean existsById(Long id);
    void deletebyId(Long id);
}
