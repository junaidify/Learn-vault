package learn_vault.dto.request.payment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class VerifyPaymentRequest {
    @NotNull(message = "Make a payment to access course.")
    private String razorpayPaymentId;

    @NotNull(message = "Make a payment to access course.")
    private String razorpayOrderId;
    @NotNull(message = "Make a payment to access course.")
    private String signature;

    @NotBlank(message = "Select a course")
    private Long courseId;
}
