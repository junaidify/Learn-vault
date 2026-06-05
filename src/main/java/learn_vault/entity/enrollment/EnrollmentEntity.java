package learn_vault.entity.enrollment;

import jakarta.persistence.*;
import learn_vault.entity.BaseEntity;
import learn_vault.entity.course.CourseEntity;
import learn_vault.entity.user.UserEntity;
import learn_vault.enums.EnrollmentStatus;
import learn_vault.enums.PaymentStatus;
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
    private CourseEntity courseId;

    @ManyToOne(fetch = FetchType.LAZY)
    @Setter(AccessLevel.NONE)
    @JoinColumn(name = "user_id")
    private UserEntity userId;

    @Enumerated(EnumType.STRING)
    private EnrollmentStatus enrollmentStatus;
    
    private LocalDateTime enrolledAt;

    protected EnrollmentEntity(){};

    public EnrollmentEntity(CourseEntity courseId, UserEntity userId, EnrollmentStatus enrollmentStatus){
        this.courseId = courseId;
        this.userId = userId;
        this.enrollmentStatus = enrollmentStatus;

    }

}
