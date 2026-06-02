package learn_vault.service;

import learn_vault.dto.request.CourseDto;
import learn_vault.dto.response.CourseResponseDto;
import learn_vault.entity.AuthorEntity;
import learn_vault.entity.CourseEntity;
import learn_vault.entity.UserEntity;
import learn_vault.enums.Role;
import learn_vault.repository.AuthorRepository;
import learn_vault.repository.CourseRepository;
import learn_vault.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CourseServiceTest {

    @Mock CourseRepository courseRepository;
    @Mock AuthorRepository authorRepository;
    @Mock UserRepository userRepository;

    @InjectMocks CourseService courseService;

    private UserEntity user;
    private AuthorEntity author;
    private CourseDto courseDto;

    @BeforeEach
    void setUp() {
        user = new UserEntity("John", "johndoe1", "john@example.com", "hashed", Role.AUTHOR);
        author = new AuthorEntity("John", user);
        courseDto = new CourseDto();
        courseDto.setTitle("Spring Boot Basics");
    }

    private void mockSecurityContext() {
        Authentication auth = mock(Authentication.class);
        when(auth.getName()).thenReturn("john@example.com");
        SecurityContext ctx = mock(SecurityContext.class);
        when(ctx.getAuthentication()).thenReturn(auth);
        SecurityContextHolder.setContext(ctx);
    }

    @Test
    void courseCreate_shouldReturnDto_onSuccess() {
        mockSecurityContext();
        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(user));
        when(authorRepository.findByUser(user)).thenReturn(Optional.of(author));
        when(courseRepository.existsByTitleAndAuthor_AuthorId(anyString(), any())).thenReturn(false);
        CourseEntity saved = new CourseEntity("Spring Boot Basics", author);
        when(courseRepository.save(any())).thenReturn(saved);

        CourseResponseDto result = courseService.courseCreate(courseDto);

        assertThat(result.getTitle()).isEqualTo("Spring Boot Basics");
        assertThat(result.getAuthorName()).isEqualTo("John");
    }

    @Test
    void courseCreate_shouldThrow_whenCourseAlreadyExists() {
        mockSecurityContext();
        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(user));
        when(authorRepository.findByUser(user)).thenReturn(Optional.of(author));
        when(courseRepository.existsByTitleAndAuthor_AuthorId(anyString(), any())).thenReturn(true);

        assertThatThrownBy(() -> courseService.courseCreate(courseDto))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("already exists");
    }

    @Test
    void courseCreate_shouldCreateAuthor_whenNotExists() {
        mockSecurityContext();
        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(user));
        when(authorRepository.findByUser(user)).thenReturn(Optional.empty());
        when(authorRepository.save(any())).thenReturn(author);
        when(courseRepository.existsByTitleAndAuthor_AuthorId(anyString(), any())).thenReturn(false);
        CourseEntity saved = new CourseEntity("Spring Boot Basics", author);
        when(courseRepository.save(any(CourseEntity.class))).thenReturn(saved);

        CourseResponseDto result = courseService.courseCreate(courseDto);

        verify(authorRepository).save(any(AuthorEntity.class));
        assertThat(result.getTitle()).isEqualTo("Spring Boot Basics");
    }

    @Test
    void getCourses_shouldReturnMappedDtos() {
        AuthorEntity a = new AuthorEntity("Jane", user);
        CourseEntity c1 = new CourseEntity("Course A", a);
        CourseEntity c2 = new CourseEntity("Course B", a);
        when(courseRepository.findAll()).thenReturn(List.of(c1, c2));

        List<CourseResponseDto> result = courseService.getCourses();

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getTitle()).isEqualTo("Course A");
    }

    @Test
    void getCourse_shouldReturnEmpty_whenNotFound() {
        when(courseRepository.findById(99L)).thenReturn(Optional.empty());
        assertThat(courseService.getCourse(99L)).isEmpty();
    }
}
