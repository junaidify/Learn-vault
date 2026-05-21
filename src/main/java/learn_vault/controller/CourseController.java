package learn_vault.controller;

import jakarta.validation.Valid;
import learn_vault.dto.CourseDto;
import learn_vault.entities.CourseEntity;
import learn_vault.service.CourseService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/course")
public class CourseController {
    private final CourseService courseService;

    public CourseController(CourseService courseService){
        this.courseService = courseService;
    }

    @PostMapping("/create-course")
    public String courseCreate(@Valid @RequestBody CourseDto dto){
        return courseService.courseCreate(dto);
    }

    @GetMapping("/")
    public List<CourseEntity> getCourses(){
        return courseService.getCourses();
    }

    @GetMapping("/{id}")
    public ResponseEntity<CourseEntity> getCourse(@PathVariable Long id){
        return courseService.getCourse(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

}
