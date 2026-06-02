package learn_vault.dto.response;

import learn_vault.entity.CourseEntity;
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
