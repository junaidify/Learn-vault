package learn_vault.controller;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import learn_vault.dto.request.CourseDto;
import learn_vault.dto.response.CourseResponseDto;
import learn_vault.entity.user.UserEntity;
import learn_vault.service.CourseService;
import learn_vault.service.S3Service;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/courses")
public class CourseController {
    private final CourseService courseService;
    private final S3Service s3Service;

    private static final List<String> ALLOWED_SORT_FIELDS =
            List.of("createdAt", "updatedAt", "price", "title");

    public CourseController(CourseService courseService, S3Service s3Service) {
        this.courseService = courseService;
        this.s3Service = s3Service;
    }

    @PostMapping(value = "/create-course", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('AUTHOR')")
    public ResponseEntity<?> courseCreate(@Valid @RequestPart("data") CourseDto dto,
                                               @RequestPart("video") MultipartFile videoUrl) {
        String url = s3Service.uploadVideo(videoUrl);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(courseService.courseCreate(dto, url));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteCourse(@PathVariable Long id){
        courseService.deleteCourse(id);
        return ResponseEntity.ok("Course deleted successfully.");
    }

    @PatchMapping("/{id}")
    public ResponseEntity<String> updateCourse(@PathVariable Long id, @Valid @RequestPart("data") CourseDto dto,
                                               @RequestPart(value = "video", required = false) MultipartFile video){
        courseService.updateCourse(id, dto, video);
        return ResponseEntity.ok("Course updated successfully.");
    }


    @GetMapping
    public ResponseEntity<Page<CourseResponseDto>> getCourses(@RequestParam(defaultValue = "0") @Min(0) int page,
                                                              @RequestParam(defaultValue = "10") @Min(1) @Max(100) int size,
                                                              @RequestParam(defaultValue = "createdAt") String sortBy,
                                                              @RequestParam(defaultValue = "DESC") String direction) {
        String safeSortBy = ALLOWED_SORT_FIELDS.contains(sortBy) ? sortBy : "createdAt";

        Sort sort = direction.equalsIgnoreCase("ASC") ?
                Sort.by(safeSortBy).ascending() : Sort.by(safeSortBy).descending();

        int safeSize = Math.min(size, 100);
        Pageable pageable = PageRequest.of(page, safeSize, sort);
        return ResponseEntity.ok(courseService.getCourses(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CourseResponseDto> getCourse(@PathVariable Long id, @AuthenticationPrincipal UserEntity currentUser) {
        return ResponseEntity.ok(courseService.getCourse(id, currentUser));
    }
}
