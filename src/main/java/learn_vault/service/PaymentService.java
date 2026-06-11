package learn_vault.service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import jakarta.transaction.Transactional;
import learn_vault.dto.request.payment.VerifyPaymentRequestDto;
import learn_vault.dto.response.CourseAmountResponseDto;
import learn_vault.entity.course.CourseEntity;
import learn_vault.entity.enrollment.EnrollmentEntity;
import learn_vault.entity.user.UserEntity;
import learn_vault.enums.EnrollmentStatus;
import learn_vault.exception.ResourceNotFoundException;
import learn_vault.repository.CourseRepository;
import learn_vault.repository.EnrollmentRepository;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class PaymentService {
    private final CourseRepository courseRepository;
    private final RazorpayClient razorpayClient;
    private final EnrollmentRepository enrollmentRepository;

    @Value("${razorpay.key.secret")
    private String razorpaySecretKey;

    public PaymentService(CourseRepository courseRepository, RazorpayClient razorpayClient,
                          EnrollmentRepository enrollmentRepository){
        this.courseRepository = courseRepository;
        this.razorpayClient = razorpayClient;
        this.enrollmentRepository = enrollmentRepository;
    }

    public CourseAmountResponseDto makePayment(Long courseId){
        CourseEntity course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course doesn't exist with" + courseId));

        long amountInPaisa = course.getAmount() * 100;

        JSONObject options = new JSONObject();
        options.put("amount", amountInPaisa);
        options.put("currency", "INR");
        options.put("receipt", "order_recptid" + courseId);

        JSONObject notes = new JSONObject();
        notes.put("course_name", course.getName());
        notes.put("course_id", courseId);
        options.put("notes", notes);

        String razorpayOrderId = "";

        try{
            Order order = razorpayClient.Orders.create(options);
            razorpayOrderId = order.get("id");
        }catch(RazorpayException e){
            throw new RuntimeException("Failed to create razorpay order " + e.getMessage());
        }

        return new CourseAmountResponseDto(
               razorpayOrderId,
                amountInPaisa,
                "INR",
                course.getName()
        );
    }

    @Transactional
    public String verifyPayment(VerifyPaymentRequestDto dto, UserEntity currentUser)  {

        boolean isExist = enrollmentRepository
                .existsByUser_IdOrCourse_Id(currentUser.getId(), dto.getCourseId());

        if(isExist) return "You are already enrolled in this course!";

        JSONObject options = new JSONObject();
        options.put("razorpay_payment_id", dto.getRazorpayPaymentId());
        options.put("razorpay_order_id", dto.getRazorpayOrderId());
        options.put("razorpay_signature", dto.getSignature());

       try{
           Utils.verifyPaymentSignature(options, razorpaySecretKey);

       }catch(com.razorpay.RazorpayException e){
           throw new RuntimeException("Payment verification failed " + e.getMessage());
       }

       CourseEntity course = courseRepository.findById(dto.getCourseId())
               .orElseThrow(() -> new ResourceNotFoundException("course doesn't exist with id: " + dto.getCourseId()));

        EnrollmentEntity enrolled = new EnrollmentEntity(
              course,currentUser, EnrollmentStatus.ACTIVE,
                LocalDateTime.now()
        );

        enrollmentRepository.save(enrolled);

        return "Course purchased successfully";
    }
}
