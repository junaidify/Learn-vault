package learn_vault.service;

import learn_vault.dto.CourseDto;
import learn_vault.dto.CourseResponseDto;
import learn_vault.entities.AuthorEntity;
import learn_vault.entities.CourseEntity;
import learn_vault.entities.UserEntity;
import learn_vault.repositories.AuthorRepository;
import learn_vault.repositories.CourseRepository;
import learn_vault.repositories.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class CourseService {
    private final CourseRepository courseRepository;
    private final AuthorRepository authorRepository;
    private final UserRepository userRepository;

    public CourseService(CourseRepository courseRepository,
                         AuthorRepository authorRepository,
                         UserRepository userRepository) {
        this.courseRepository = courseRepository;
        this.authorRepository = authorRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public CourseResponseDto courseCreate(CourseDto dto) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        AuthorEntity author = authorRepository.findByUser(user)
                .orElseGet(() -> authorRepository.save(new AuthorEntity(user.getName(), user)));

        if (courseRepository.existsByTitleAndAuthor_AuthorId(dto.getTitle(), author.getAuthorId())) {
            throw new IllegalStateException("Course already exists under this author");
        }

        CourseEntity course = courseRepository.save(new CourseEntity(dto.getTitle(), author));
        return new CourseResponseDto(course);
    }

    @Transactional(readOnly = true)
    public List<CourseResponseDto> getCourses() {
        return courseRepository.findAll()
                .stream()
                .map(CourseResponseDto::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public Optional<CourseResponseDto> getCourse(Long id) {
        return courseRepository.findById(id).map(CourseResponseDto::new);
    }
}
