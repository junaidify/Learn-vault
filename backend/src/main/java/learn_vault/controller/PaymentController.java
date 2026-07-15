package learn_vault.controller;

import com.razorpay.RazorpayException;
import jakarta.validation.Valid;
import learn_vault.dto.request.payment.VerifyPaymentRequestDto;
import learn_vault.dto.response.CourseAmountResponseDto;
import learn_vault.entity.user.UserEntity;
import learn_vault.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payment")
public class PaymentController {
    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService){
        this.paymentService = paymentService;
    }

    @PostMapping("/order/{courseId}")
    public ResponseEntity<CourseAmountResponseDto> makePayment(@Valid @PathVariable Long courseId){
        return ResponseEntity.ok(paymentService.makePayment(courseId));
    }

    @PostMapping("/verify")
    public ResponseEntity<java.util.Map<String, String>> verifyPayment(@Valid @RequestBody VerifyPaymentRequestDto dto,
                                                                       @AuthenticationPrincipal UserEntity currentUser){
        String message = paymentService.verifyPayment(dto, currentUser);
        return ResponseEntity.ok(java.util.Map.of("message", message));
    }


}
