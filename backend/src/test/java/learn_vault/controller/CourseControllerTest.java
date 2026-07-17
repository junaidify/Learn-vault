package learn_vault.controller;

import learn_vault.dto.response.CourseResponseDto;
import learn_vault.entity.course.CourseEntity;
import learn_vault.entity.user.AuthorEntity;
import learn_vault.entity.user.UserEntity;
import learn_vault.enums.Category;
import learn_vault.enums.Role;
import learn_vault.exception.GlobalExceptionHandler;
import learn_vault.exception.ResourceNotFoundException;
import learn_vault.security.JwtFilters;
import learn_vault.security.JwtUtils;
import learn_vault.security.Oauth2SuccessHandler;
import learn_vault.security.SecurityConfig;
import learn_vault.service.CourseService;
import learn_vault.service.CustomUserDetailsService;
import learn_vault.service.S3Service;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.springframework.web.cors.CorsConfigurationSource;

@WebMvcTest(CourseController.class)
@Import({GlobalExceptionHandler.class, SecurityConfig.class, JwtFilters.class})
class CourseControllerTest {

    @Autowired MockMvc mockMvc;

    @MockBean CourseService courseService;
    @MockBean S3Service s3Service;
    @MockBean JwtUtils jwtUtils;
    @MockBean CustomUserDetailsService customUserDetailsService;
    @MockBean AuthenticationProvider authenticationProvider;
    @MockBean Oauth2SuccessHandler oauth2SuccessHandler;
    @MockBean learn_vault.repository.UserRepository userRepository;

    @org.springframework.boot.test.context.TestConfiguration
    static class TestConfig {
        @org.springframework.context.annotation.Bean
        public org.springframework.web.cors.CorsConfigurationSource corsConfigurationSource() {
            return new org.springframework.web.cors.UrlBasedCorsConfigurationSource();
        }
    }

    // ── Create Course (multipart) ────────────────────────────────────

    @Test
    @WithMockUser(roles = "AUTHOR")
    void createCourse_shouldReturn201_onSuccess() throws Exception {
        when(s3Service.uploadVideo(any())).thenReturn("videos/test-key.mp4");
        when(courseService.courseCreate(any(), anyString())).thenReturn("Course created successfully.");

        String courseJson = """
                {
                    "name": "Spring Boot",
                    "description": "Learn Spring Boot",
                    "amount": 999,
                    "category": "TECH",
                    "published": true,
                    "videoUrl": "dummy",
                    "author": "John Doe"
                }
                """;

        MockMultipartFile dataPart = new MockMultipartFile(
                "data", "", MediaType.APPLICATION_JSON_VALUE, courseJson.getBytes());
        MockMultipartFile videoPart = new MockMultipartFile(
                "video", "lecture.mp4", "video/mp4", "fake-video-bytes".getBytes());

        mockMvc.perform(multipart("/api/v1/courses/create-course")
                        .file(dataPart)
                        .file(videoPart)
                        .with(csrf()))
                .andExpect(status().isCreated());
    }

    @Test
    @WithMockUser(roles = "STUDENT")
    void createCourse_shouldReturn403_forStudent() throws Exception {
        String courseJson = """
                {"name":"Test","description":"Desc","amount":100,"category":"TECH","published":true,"videoUrl":"x","author":"A"}
                """;

        MockMultipartFile dataPart = new MockMultipartFile(
                "data", "", MediaType.APPLICATION_JSON_VALUE, courseJson.getBytes());
        MockMultipartFile videoPart = new MockMultipartFile(
                "video", "v.mp4", "video/mp4", "bytes".getBytes());

        mockMvc.perform(multipart("/api/v1/courses/create-course")
                        .file(dataPart)
                        .file(videoPart)
                        .with(csrf()))
                .andExpect(status().isForbidden());
    }

    // ── Get Courses (paginated, public) ─────────────────────────────

    @Test
    @WithMockUser(roles = "STUDENT")
    void getCourses_shouldReturn200_withPage() throws Exception {
        UserEntity user = new UserEntity("Jane", "janedoe1", "jane@example.com", "hashed", Role.AUTHOR);
        AuthorEntity author = new AuthorEntity(user);
        CourseEntity c1 = new CourseEntity("Course A", "Desc", 100L,
                Category.TECH, true, author, null);
        CourseResponseDto dto = new CourseResponseDto(c1, false);
        Page<CourseResponseDto> page = new PageImpl<>(List.of(dto), PageRequest.of(0, 10), 1);

        when(courseService.getCourses(any(), any(), any())).thenReturn(page);

        mockMvc.perform(get("/api/v1/courses")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].name").value("Course A"));
    }

    // ── Get Single Course ───────────────────────────────────────────

    @Test
    @WithMockUser(roles = "STUDENT")
    void getCourse_shouldReturn200_whenFound() throws Exception {
        UserEntity user = new UserEntity("Jane", "janedoe1", "jane@example.com", "hashed", Role.AUTHOR);
        AuthorEntity author = new AuthorEntity(user);
        CourseEntity course = new CourseEntity("Spring Boot", "Desc", 999L,
                Category.TECH, true, author, null);
        CourseResponseDto dto = new CourseResponseDto(course, false);

        when(courseService.getCourse(eq(1L), any())).thenReturn(dto);

        mockMvc.perform(get("/api/v1/courses/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Spring Boot"));
    }

    @Test
    @WithMockUser(roles = "STUDENT")
    void getCourse_shouldReturn404_whenNotFound() throws Exception {
        when(courseService.getCourse(eq(99L), any()))
                .thenThrow(new ResourceNotFoundException("Course with ID 99 not found"));

        mockMvc.perform(get("/api/v1/courses/99"))
                .andExpect(status().isNotFound());
    }

    // ── Delete Course ───────────────────────────────────────────────

    @Test
    @WithMockUser(roles = "AUTHOR")
    void deleteCourse_shouldReturn200_onSuccess() throws Exception {
        mockMvc.perform(delete("/api/v1/courses/1").with(csrf()))
                .andExpect(status().isOk());
    }
}
