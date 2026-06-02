package learn_vault.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CourseDto {
    @NotBlank(message = "Title is required.")
    private String title;
}
