package learn_vault.controller;

import jakarta.validation.Valid;
import learn_vault.dto.response.CourseAmountResponseDto;
import learn_vault.service.PaymentService;
import org.springframework.http.ResponseEntity;
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


}
