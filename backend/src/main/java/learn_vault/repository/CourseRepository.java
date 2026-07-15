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
    void deleteById(Long id);

    Page<CourseEntity> findByCategory(learn_vault.enums.Category category, Pageable pageable);

    @org.springframework.data.jpa.repository.Query("""
        SELECT c FROM CourseEntity c
        WHERE LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%'))
           OR LOWER(c.description) LIKE LOWER(CONCAT('%', :search, '%'))
           OR LOWER(c.author.user.name) LIKE LOWER(CONCAT('%', :search, '%'))
    """)
    Page<CourseEntity> findBySearch(
        @org.springframework.data.repository.query.Param("search") String search,
        Pageable pageable
    );

    @org.springframework.data.jpa.repository.Query("""
        SELECT c FROM CourseEntity c
        WHERE c.category = :category
          AND (LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(c.description) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(c.author.user.name) LIKE LOWER(CONCAT('%', :search, '%')))
    """)
    Page<CourseEntity> findByCategoryAndSearch(
        @org.springframework.data.repository.query.Param("category") learn_vault.enums.Category category,
        @org.springframework.data.repository.query.Param("search") String search,
        Pageable pageable
    );
}
