package learn_vault.service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import learn_vault.dto.response.CourseAmountResponseDto;
import learn_vault.entity.course.CourseEntity;
import learn_vault.exception.ResourceNotFoundException;
import learn_vault.repository.CourseRepository;
import org.json.JSONObject;
import org.springframework.stereotype.Service;

@Service
public class PaymentService {
    private final CourseRepository courseRepository;
    private final RazorpayClient razorpayClient;

    public PaymentService(CourseRepository courseRepository, RazorpayClient razorpayClient){
        this.courseRepository = courseRepository;
        this.razorpayClient = razorpayClient;
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
}
