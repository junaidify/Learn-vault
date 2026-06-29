package learn_vault.dto.response;

import learn_vault.entity.course.CourseEntity;
import learn_vault.enums.Category;
import lombok.Getter;
import lombok.Setter;
import lombok.Value;

import java.time.LocalDateTime;

//@Value -> it does 3 things. 1 makes every variable private and final. 2. Generates Getter 3. Generates Setter
@Getter
public class CourseResponseDto {
    private final Long id;
    private final String name;
    private final String description;
    private final Long amount;
    private final Category category;
    private final String authorName;
    private final boolean published;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;
    private final String videoUrl;

    public CourseResponseDto(CourseEntity course, boolean hasAccess) {
        this.id = course.getId();
        this.name = course.getName();
        this.description = course.getDescription();
        this.amount = course.getAmount();
        this.category = course.getCategory();
        this.authorName = course.getAuthor().getUser().getName();
        this.published = course.getPublished();
        this.createdAt = course.getCreatedAt();
        this.updatedAt = course.getUpdatedAt();
        this.videoUrl = hasAccess ? course.getVideoKey() : null;
    }

}
