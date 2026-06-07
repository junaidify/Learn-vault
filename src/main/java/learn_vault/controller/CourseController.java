package learn_vault.controller;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import learn_vault.dto.request.CourseDto;
import learn_vault.dto.response.CourseResponseDto;
import learn_vault.service.CourseService;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;

import java.util.List;

@RestController
@RequestMapping("api/v1/courses")
public class CourseController {
    private final CourseService courseService;
    private static final List<String> ALLOWED_SORT_FIELDS =
            List.of("createdAt", "updatedAt", "price", "title");

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
    public ResponseEntity<Page<CourseResponseDto>> getCourses(@RequestParam(defaultValue = "0") @Min(0) int page,
                                                              @RequestParam(defaultValue = "10") @Min(1) @Max(100) int size,
                                                              @RequestParam(defaultValue = "createAt") String sortBy,
                                                              @RequestParam(defaultValue = "DESC") String direction) {

        String safeSortBy = ALLOWED_SORT_FIELDS.contains(sortBy) ? sortBy : "createdAt";

        Sort sort = direction.equalsIgnoreCase("ASC") ?
                Sort.by(safeSortBy).ascending() : Sort.by(safeSortBy).descending();

        int safeSize = Math.min(size, 100);
        Pageable pageable = PageRequest.of(page, safeSize, sort);
        return ResponseEntity.ok(courseService.getCourses(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CourseResponseDto> getCourse(@PathVariable Long id) {
        return ResponseEntity.ok(courseService.getCourse(id));
    }
}
