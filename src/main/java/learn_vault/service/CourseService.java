package learn_vault.service;

import learn_vault.dto.request.CourseDto;
import learn_vault.dto.response.CourseResponseDto;
import learn_vault.entity.user.AuthorEntity;
import learn_vault.entity.course.CourseEntity;
import learn_vault.entity.user.UserEntity;
import learn_vault.enums.Role;
import learn_vault.exception.DuplicateResourceException;
import learn_vault.exception.ResourceNotFoundException;
import learn_vault.mapper.CourseMapper;
import learn_vault.repository.AuthorRepository;
import learn_vault.repository.CourseRepository;
import learn_vault.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;


@Service
public class CourseService {
    private final CourseRepository courseRepository;
    private final AuthorRepository authorRepository;
    private final UserRepository userRepository;
    private final CourseMapper courseMapper;

    public CourseService(CourseRepository courseRepository,
                         AuthorRepository authorRepository,
                         UserRepository userRepository,
                         CourseMapper courseMapper) {
        this.courseRepository = courseRepository;
        this.authorRepository = authorRepository;
        this.userRepository = userRepository;
        this.courseMapper = courseMapper;
    }

    @Transactional
    public CourseResponseDto courseCreate(CourseDto dto) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if(user.getRole() != Role.AUTHOR){
            throw new ResourceNotFoundException("User not found");
        }

        AuthorEntity author = authorRepository.findByUserId(user.getId());

        if (courseRepository.existsByTitleAndAuthor_Id(dto.getTitle(), author.getId())) {
            throw new DuplicateResourceException("Course already exists under this author");
        }


        CourseEntity course = courseRepository.save(new CourseEntity(dto.getTitle(), user.getName()));
        return new CourseResponseDto(course);
    }

    @Transactional(readOnly = true)
    public Page<CourseResponseDto> getCourses(Pageable pageable) {
        Page<CourseEntity> coursePage = courseRepository.findAll(pageable);

        return coursePage.map(course -> courseMapper.toDto(course));
    }

    @Transactional(readOnly = true)
    public CourseResponseDto getCourse(Long id) {
        CourseEntity course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course with ID " + id + " not found"));

        return new CourseResponseDto(course);
    }
}
