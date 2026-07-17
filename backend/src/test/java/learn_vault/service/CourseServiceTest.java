package learn_vault.service;

import learn_vault.dto.request.CourseDto;
import learn_vault.dto.response.CourseResponseDto;
import learn_vault.entity.course.CourseEntity;
import learn_vault.entity.user.AuthorEntity;
import learn_vault.entity.user.UserEntity;
import learn_vault.enums.Category;
import learn_vault.enums.Role;
import learn_vault.exception.DuplicateResourceException;
import learn_vault.exception.ResourceNotFoundException;
import learn_vault.mapper.CourseMapper;
import learn_vault.repository.AuthorRepository;
import learn_vault.repository.CourseRepository;
import learn_vault.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CourseServiceTest {

    @Mock CourseRepository courseRepository;
    @Mock AuthorRepository authorRepository;
    @Mock UserRepository userRepository;
    @Mock CourseMapper courseMapper;
    @Mock S3Service s3Service;

    @InjectMocks CourseService courseService;

    private UserEntity authorUser;
    private AuthorEntity author;
    private CourseDto courseDto;

    @BeforeEach
    void setUp() {
        authorUser = new UserEntity("John Doe", "johndoe1", "john@example.com", "hashed", Role.AUTHOR);
        org.springframework.test.util.ReflectionTestUtils.setField(authorUser, "id", 1L);
        author = new AuthorEntity(authorUser);
        org.springframework.test.util.ReflectionTestUtils.setField(author, "id", 1L);

        courseDto = new CourseDto();
        courseDto.setName("Spring Boot Basics");
        courseDto.setDescription("Learn Spring Boot from scratch");
        courseDto.setAmount(999L);
        courseDto.setCategory(Category.TECH);
        courseDto.setPublished(true);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    private void mockSecurityContext(String email) {
        Authentication auth = mock(Authentication.class);
        when(auth.getName()).thenReturn(email);
        SecurityContext ctx = mock(SecurityContext.class);
        when(ctx.getAuthentication()).thenReturn(auth);
        SecurityContextHolder.setContext(ctx);
    }

    // ── courseCreate ─────────────────────────────────────────────────

    @Test
    void courseCreate_shouldReturnSuccessMessage_onSuccess() {
        mockSecurityContext("john@example.com");
        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(authorUser));
        when(authorRepository.findByUserId(any())).thenReturn(author);
        when(courseRepository.existsByNameAndAuthor_Id(anyString(), any())).thenReturn(false);
        when(courseRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        String result = courseService.courseCreate(courseDto, "videos/test-key.mp4");

        assertThat(result).isEqualTo("Course created successfully.");
        verify(courseRepository).save(any(CourseEntity.class));
    }

    @Test
    void courseCreate_shouldThrow_whenCourseAlreadyExists() {
        mockSecurityContext("john@example.com");
        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(authorUser));
        when(authorRepository.findByUserId(any())).thenReturn(author);
        when(courseRepository.existsByNameAndAuthor_Id(anyString(), any())).thenReturn(true);

        assertThatThrownBy(() -> courseService.courseCreate(courseDto, "videos/key.mp4"))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("already exists");
    }

    @Test
    void courseCreate_shouldThrow_whenUserNotFound() {
        mockSecurityContext("unknown@example.com");
        when(userRepository.findByEmail("unknown@example.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> courseService.courseCreate(courseDto, "videos/key.mp4"))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void courseCreate_shouldThrow_whenUserIsNotAuthor() {
        UserEntity studentUser = new UserEntity("Jane", "janestudent", "jane@example.com", "hashed", Role.STUDENT);
        mockSecurityContext("jane@example.com");
        when(userRepository.findByEmail("jane@example.com")).thenReturn(Optional.of(studentUser));

        assertThatThrownBy(() -> courseService.courseCreate(courseDto, "videos/key.mp4"))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // ── deleteCourse ─────────────────────────────────────────────────

    @Test
    void deleteCourse_shouldDelete_whenCourseExists() {
        when(courseRepository.existsById(1L)).thenReturn(true);

        courseService.deleteCourse(1L);

        verify(courseRepository).deleteById(1L);
    }

    @Test
    void deleteCourse_shouldThrow_whenCourseNotFound() {
        when(courseRepository.existsById(99L)).thenReturn(false);

        assertThatThrownBy(() -> courseService.deleteCourse(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Course not found");
    }

    // ── updateCourse ─────────────────────────────────────────────────

    @Test
    void updateCourse_shouldUpdate_withoutVideoReplacement() {
        CourseEntity existingCourse = new CourseEntity("Old Name", "Old Desc", 500L,
                Category.TECH, true, author, "videos/old-key.mp4");
        when(courseRepository.findById(1L)).thenReturn(Optional.of(existingCourse));

        courseService.updateCourse(1L, courseDto, null);

        assertThat(existingCourse.getName()).isEqualTo("Spring Boot Basics");
        verify(courseRepository).save(existingCourse);
        verify(s3Service, never()).deleteVideo(any());
    }

    @Test
    void updateCourse_shouldReplaceVideo_whenNewVideoProvided() {
        CourseEntity existingCourse = new CourseEntity("Old Name", "Old Desc", 500L,
                Category.TECH, true, author, "videos/old-key.mp4");
        when(courseRepository.findById(1L)).thenReturn(Optional.of(existingCourse));

        MultipartFile mockVideo = mock(MultipartFile.class);
        when(mockVideo.isEmpty()).thenReturn(false);
        when(s3Service.uploadVideo(mockVideo)).thenReturn("videos/new-key.mp4");

        courseService.updateCourse(1L, courseDto, mockVideo);

        verify(s3Service).deleteVideo("videos/old-key.mp4");
        verify(s3Service).uploadVideo(mockVideo);
        assertThat(existingCourse.getVideoKey()).isEqualTo("videos/new-key.mp4");
    }

    @Test
    void updateCourse_shouldThrow_whenCourseNotFound() {
        when(courseRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> courseService.updateCourse(99L, courseDto, null))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // ── getCourses (paginated) ───────────────────────────────────────

    @Test
    void getCourses_shouldReturnMappedPage() {
        CourseEntity c1 = new CourseEntity("Course A", "Desc A", 100L,
                Category.TECH, true, author, null);
        CourseEntity c2 = new CourseEntity("Course B", "Desc B", 200L,
                Category.LANGUAGE, true, author, null);

        Pageable pageable = PageRequest.of(0, 10);
        Page<CourseEntity> coursePage = new PageImpl<>(List.of(c1, c2), pageable, 2);
        when(courseRepository.findAll(pageable)).thenReturn(coursePage);
        when(courseMapper.toDto(any())).thenAnswer(inv -> {
            CourseEntity entity = inv.getArgument(0);
            return new CourseResponseDto(entity, false);
        });

        Page<CourseResponseDto> result = courseService.getCourses(pageable);

        assertThat(result.getContent()).hasSize(2);
        assertThat(result.getContent().get(0).getName()).isEqualTo("Course A");
    }

    // ── getCourse ────────────────────────────────────────────────────

    @Test
    void getCourse_shouldReturnDto_whenFound() {
        CourseEntity course = new CourseEntity("Spring Boot", "Desc", 999L,
                Category.TECH, true, author, "videos/key.mp4");
        when(courseRepository.findById(1L)).thenReturn(Optional.of(course));

        CourseResponseDto result = courseService.getCourse(1L, authorUser);

        assertThat(result.getName()).isEqualTo("Spring Boot");
    }

    @Test
    void getCourse_shouldThrow_whenNotFound() {
        when(courseRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> courseService.getCourse(99L, authorUser))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("not found");
    }
}
