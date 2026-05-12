package learn_vault.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CourseDto {
    @NotBlank(message = "Title is required.")
    private String title;

    @NotBlank(message = "Author's name is required.")
    private String authorName;
}
