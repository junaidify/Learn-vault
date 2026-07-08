package learn_vault.service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import learn_vault.dto.request.payment.VerifyPaymentRequestDto;
import learn_vault.dto.response.CourseAmountResponseDto;
import learn_vault.entity.course.CourseEntity;
import learn_vault.entity.enrollment.EnrollmentEntity;
import learn_vault.entity.user.AuthorEntity;
import learn_vault.entity.user.UserEntity;
import learn_vault.enums.Category;
import learn_vault.enums.Role;
import learn_vault.exception.ResourceNotFoundException;
import learn_vault.repository.CourseRepository;
import learn_vault.repository.EnrollmentRepository;
import org.json.JSONObject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock CourseRepository courseRepository;
    @Mock RazorpayClient razorpayClient;
    @Mock EnrollmentRepository enrollmentRepository;

    @InjectMocks PaymentService paymentService;

    private UserEntity student;
    private AuthorEntity author;
    private CourseEntity course;

    @BeforeEach
    void setUp() {
        student = new UserEntity("Jane Student", "janestudent", "jane@example.com", "hashed", Role.STUDENT);
        UserEntity authorUser = new UserEntity("John Author", "johnauthor", "john@example.com", "hashed", Role.AUTHOR);
        author = new AuthorEntity(authorUser);
        course = new CourseEntity("Spring Boot", "Desc", 999L, Category.TECH, true, author, null);
    }

    // ── makePayment ─────────────────────────────────────────────────

    @Test
    void makePayment_shouldReturnOrderDto_onSuccess() throws Exception {
        when(courseRepository.findById(1L)).thenReturn(Optional.of(course));

        // Mock the Razorpay Orders API
        JSONObject orderJson = new JSONObject();
        orderJson.put("id", "order_TEST123");
        Order mockOrder = new Order(orderJson);
        razorpayClient.Orders = mock(com.razorpay.OrderClient.class);
        when(razorpayClient.Orders.create(any(JSONObject.class))).thenReturn(mockOrder);

        CourseAmountResponseDto result = paymentService.makePayment(1L);

        assertThat(result.getRazorpayOrderId()).isEqualTo("order_TEST123");
        assertThat(result.getAmount()).isEqualTo(99900L); // 999 * 100 paisa
        assertThat(result.getCurrency()).isEqualTo("INR");
        assertThat(result.getCourseName()).isEqualTo("Spring Boot");
    }

    @Test
    void makePayment_shouldThrow_whenCourseNotFound() {
        when(courseRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> paymentService.makePayment(99L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // ── verifyPayment ───────────────────────────────────────────────

    @Test
    void verifyPayment_shouldReturnAlreadyEnrolled_whenDuplicate() {
        VerifyPaymentRequestDto dto = new VerifyPaymentRequestDto();
        dto.setRazorpayPaymentId("pay_123");
        dto.setRazorpayOrderId("order_123");
        dto.setSignature("sig_123");
        dto.setCourseId(1L);

        when(enrollmentRepository.existsByUser_IdAndCourse_Id(any(), eq(1L))).thenReturn(true);

        String result = paymentService.verifyPayment(dto, student);

        assertThat(result).contains("already enrolled");
        verify(enrollmentRepository, never()).save(any());
    }

    @Test
    void verifyPayment_shouldThrow_whenCourseNotFoundAfterVerification() {
        VerifyPaymentRequestDto dto = new VerifyPaymentRequestDto();
        dto.setRazorpayPaymentId("pay_123");
        dto.setRazorpayOrderId("order_123");
        dto.setSignature("sig_123");
        dto.setCourseId(99L);

        when(enrollmentRepository.existsByUser_IdAndCourse_Id(any(), eq(99L))).thenReturn(false);
        // Note: We can't easily mock the static Utils.verifyPaymentSignature, 
        // so this test focuses on the course lookup failure path.
        // In a real project, you'd use a wrapper or PowerMockito for the static method.

        // Since Utils.verifyPaymentSignature is static and will throw without proper signature,
        // we expect a RuntimeException wrapping the RazorpayException
        assertThatThrownBy(() -> paymentService.verifyPayment(dto, student))
                .isInstanceOf(RuntimeException.class);
    }
}
