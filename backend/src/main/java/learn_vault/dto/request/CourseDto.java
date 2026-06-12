package learn_vault.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import learn_vault.enums.Category;
import lombok.Data;

@Data
public class CourseDto {
    @NotBlank(message = "Course's Name is required.")
    private String name;

    @NotBlank(message = "It must to describe about course.")
    private String description;

    @NotNull(message = "Enter a valid amount")
    @Positive(message = "Amount should always positive.")
    private Long amount;

    @NotBlank(message = "Please specify the category")
    private Category category;

    @NotNull
    private boolean published;

    @NotBlank(message = "upload course video")
    private String videoUrl;

    @NotBlank(message = "Please enter the author's name.")
    private String author;

}
