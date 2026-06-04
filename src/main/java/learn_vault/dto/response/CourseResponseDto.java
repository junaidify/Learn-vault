package learn_vault.dto.response;

import learn_vault.entity.course.CourseEntity;
import learn_vault.enums.Category;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Setter
@Getter
public class CourseResponseDto {
    private final Long id;
    private final String title;
    private final String description;
    private final double price;
    private final Category category;
    private final String authorName;
    private final boolean published;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;

    public CourseResponseDto(Long id, String title, String description,
                             Category category, double price, String authorName,
                             boolean published, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.price = price;
        this.category = category;
        this.authorName = authorName ;
        this.published = published;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

}
