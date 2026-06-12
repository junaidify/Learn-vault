package learn_vault.entity.payment;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import learn_vault.entity.BaseEntity;
import learn_vault.entity.course.CourseEntity;
import learn_vault.entity.user.UserEntity;
import learn_vault.enums.PaymentStatus;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "payments")
public class PaymentEntity extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Setter(AccessLevel.NONE)
    private Long id;

    private String razorpayPaymentId;

    @NotNull(message = "Course can't be accessed without payment.")
    private String razorpayOrderId;

    @Enumerated(EnumType.STRING)
    private PaymentStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id")
    private CourseEntity course;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private UserEntity user;

    protected PaymentEntity(){};

    public PaymentEntity(String razorpayPaymentId, String razorpayOrderId,
                         CourseEntity course, UserEntity user, PaymentStatus status){
        this.razorpayPaymentId = razorpayPaymentId;
        this.razorpayOrderId = razorpayOrderId;
        this.user = user;
        this.course = course;
        this.status = status;
    }
}
