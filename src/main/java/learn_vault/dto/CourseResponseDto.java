package learn_vault.dto;

import learn_vault.entities.CourseEntity;
import lombok.Getter;

@Getter
public class CourseResponseDto {
    private final Long id;
    private final String title;
    private final String authorName;

    public CourseResponseDto(CourseEntity course) {
        this.id = course.getId();
        this.title = course.getTitle();
        this.authorName = course.getAuthor().getAuthorName();
    }
}
