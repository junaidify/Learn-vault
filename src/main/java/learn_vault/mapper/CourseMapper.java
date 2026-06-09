package learn_vault.mapper;

import learn_vault.dto.response.CourseResponseDto;
import learn_vault.entity.course.CourseEntity;
import org.springframework.stereotype.Component;

@Component
public class CourseMapper {

    public CourseResponseDto toDto(CourseEntity entity){
      String authorName = "UNKNOWN";

      if(entity.getAuthor() != null && entity.getAuthor().getUser().getName() != null){
          authorName = entity.getAuthor().getUser().getName();
      }

      return new CourseResponseDto(entity);
    }
}
