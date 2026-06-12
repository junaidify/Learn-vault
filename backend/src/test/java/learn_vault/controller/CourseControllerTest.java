package learn_vault.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import learn_vault.dto.request.CourseDto;
import learn_vault.dto.response.CourseResponseDto;
import learn_vault.entity.user.AuthorEntity;
import learn_vault.entity.course.CourseEntity;
import learn_vault.service.CourseService;
import learn_vault.service.CustomUserDetailsService;
import learn_vault.exception.GlobalExceptionHandler;
import learn_vault.security.JwtFilters;
import learn_vault.security.JwtUtils;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(CourseController.class)
@Import(GlobalExceptionHandler.class)
class CourseControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    @MockitoBean CourseService courseService;
    @MockitoBean JwtUtils jwtUtils;
    @MockitoBean JwtFilters jwtFilters;
    @MockitoBean CustomUserDetailsService customUserDetailsService;

    @Test
    @WithMockUser(roles = "AUTHOR")
    void createCourse_shouldReturn201_onSuccess() throws Exception {
        when(courseService.courseCreate(any())).thenReturn(stubCourseResponse("Spring Boot"));

        CourseDto dto = new CourseDto();
        dto.setTitle("Spring Boot");

        mockMvc.perform(post("/course/create-course")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Spring Boot"))
                .andExpect(jsonPath("$.authorName").value("Jane Author"));
    }

    @Test
    @WithMockUser(roles = "AUTHOR")
    void createCourse_shouldReturn409_whenDuplicate() throws Exception {
        when(courseService.courseCreate(any()))
                .thenThrow(new IllegalStateException("Course already exists under this author"));

        CourseDto dto = new CourseDto();
        dto.setTitle("Duplicate");

        mockMvc.perform(post("/course/create-course")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isConflict());
    }

    @Test
    @WithMockUser(roles = "AUTHOR")
    void createCourse_shouldReturn400_whenTitleMissing() throws Exception {
        CourseDto dto = new CourseDto();

        mockMvc.perform(post("/course/create-course")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(roles = "STUDENT")
    void getCourses_shouldReturn200_withList() throws Exception {
        when(courseService.getCourses()).thenReturn(List.of(stubCourseResponse("Course A")));

        mockMvc.perform(get("/course"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Course A"));
    }

    @Test
    @WithMockUser(roles = "STUDENT")
    void getCourse_shouldReturn200_whenFound() throws Exception {
        when(courseService.getCourse(1L)).thenReturn(Optional.of(stubCourseResponse("Course A")));

        mockMvc.perform(get("/course/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Course A"));
    }

    @Test
    @WithMockUser(roles = "STUDENT")
    void getCourse_shouldReturn404_whenNotFound() throws Exception {
        when(courseService.getCourse(anyLong())).thenReturn(Optional.empty());

        mockMvc.perform(get("/course/99"))
                .andExpect(status().isNotFound());
    }

    private CourseResponseDto stubCourseResponse(String title) {
        AuthorEntity author = new AuthorEntity("Jane Author");
        CourseEntity course = new CourseEntity(title, author);
        return new CourseResponseDto(course);
    }
}
