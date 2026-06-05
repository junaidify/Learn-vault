package learn_vault.dto.request.payment;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class CreateOrderRequest {
    @NotBlank
    private Long courseId;
}
