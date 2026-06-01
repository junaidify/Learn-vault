package learn_vault.controller;

import jakarta.validation.Valid;
import learn_vault.dto.CourseDto;
import learn_vault.dto.CourseResponseDto;
import learn_vault.service.CourseService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/course")
public class CourseController {
    private final CourseService courseService;

    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    @PostMapping("/create-course")
    @PreAuthorize("hasRole('AUTHOR')")
    public ResponseEntity<CourseResponseDto> courseCreate(@Valid @RequestBody CourseDto dto) {
        CourseResponseDto created = courseService.courseCreate(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    public ResponseEntity<List<CourseResponseDto>> getCourses() {
        return ResponseEntity.ok(courseService.getCourses());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CourseResponseDto> getCourse(@PathVariable Long id) {
        return courseService.getCourse(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
