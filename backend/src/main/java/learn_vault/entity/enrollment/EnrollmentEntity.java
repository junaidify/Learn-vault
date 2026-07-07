package learn_vault.entity.enrollment;

import jakarta.persistence.*;
import learn_vault.entity.BaseEntity;
import learn_vault.entity.course.CourseEntity;
import learn_vault.entity.user.UserEntity;
import learn_vault.enums.EnrollmentStatus;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Setter
@Getter
@Entity
@Table(name = "enrollment")
public class EnrollmentEntity extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Setter(AccessLevel.NONE)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @Setter(AccessLevel.NONE)
    @JoinColumn(name = "course_id")
    private CourseEntity course;

    @ManyToOne(fetch = FetchType.LAZY)
    @Setter(AccessLevel.NONE)
    @JoinColumn(name = "user_id")
    private UserEntity user;

    @Enumerated(EnumType.STRING)
    private EnrollmentStatus enrollmentStatus;
    
    private LocalDateTime enrolledAt;

    protected EnrollmentEntity(){};

    public EnrollmentEntity(CourseEntity course, UserEntity user, EnrollmentStatus enrollmentStatus, LocalDateTime enrolledAt){
        this.course = course;
        this.user = user;
        this.enrollmentStatus = enrollmentStatus;
        this.enrolledAt = enrolledAt;
    }

}
