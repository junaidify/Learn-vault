package learn_vault.dto.response;
import lombok.Data;

@Data
public class CourseAmountResponseDto {
    private String razorpayOrderId;
    private Long amount;
    private String currency;
    private String courseName;

    public CourseAmountResponseDto(String razorpayOrderId, Long amount, String currency, String courseName){
        this.razorpayOrderId = razorpayOrderId;
        this.amount = amount;
        this.currency = currency;
        this.courseName = courseName;
    }

}
