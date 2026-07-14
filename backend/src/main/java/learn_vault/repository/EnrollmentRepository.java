package learn_vault.repository;

import learn_vault.entity.enrollment.EnrollmentEntity;
import learn_vault.enums.EnrollmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EnrollmentRepository extends JpaRepository<EnrollmentEntity, Long> {
    boolean existsByUser_IdOrCourse_Id(Long userId, Long courseId);
    boolean existsByUser_IdAndCourse_Id(Long userId, Long courseId);
    List<EnrollmentEntity> findByUser_IdAndEnrollmentStatus(Long userId, EnrollmentStatus status);
}
