package learn_vault.service;

import learn_vault.dto.request.CourseDto;
import learn_vault.dto.response.CourseResponseDto;
import java.util.List;
import learn_vault.entity.user.AuthorEntity;
import learn_vault.entity.course.CourseEntity;
import learn_vault.entity.user.UserEntity;
import learn_vault.enums.EnrollmentStatus;
import learn_vault.enums.Role;
import learn_vault.exception.DuplicateResourceException;
import learn_vault.exception.ResourceNotFoundException;
import learn_vault.mapper.CourseMapper;
import learn_vault.repository.AuthorRepository;
import learn_vault.repository.CourseRepository;
import learn_vault.repository.UserRepository;
import learn_vault.repository.EnrollmentRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.web.multipart.MultipartFile;


@Service
public class CourseService {
    private final CourseRepository courseRepository;
    private final AuthorRepository authorRepository;
    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final CourseMapper courseMapper;
    private final S3Service s3Service;

    public CourseService(CourseRepository courseRepository, AuthorRepository authorRepository,
                         UserRepository userRepository, EnrollmentRepository enrollmentRepository,
                         CourseMapper courseMapper, S3Service s3Service) {
        this.courseRepository = courseRepository;
        this.authorRepository = authorRepository;
        this.userRepository = userRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.courseMapper = courseMapper;
        this.s3Service = s3Service;
    }

    @Transactional
    public String courseCreate(CourseDto dto, String videoUrl) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if(user.getRole() != Role.AUTHOR){
            throw new ResourceNotFoundException("User not found");
        }

        AuthorEntity author = authorRepository.findByUserId(user.getId());

        if (courseRepository.existsByNameAndAuthor_Id(dto.getName(), author.getId())) {
            throw new DuplicateResourceException("Course already exists under this author");
        }

        CourseEntity course = new CourseEntity(dto.getName(), dto.getDescription(), dto.getAmount(),
                dto.getCategory(), dto.isPublished(), author, videoUrl);

        courseRepository.save(course);
        return "Course created successfully.";
    }

    @Transactional
    public void deleteCourse(Long id){
        if(!courseRepository.existsById(id)){
            throw new ResourceNotFoundException("Course not found with id " + id);
        }

        courseRepository.deleteById(id);
    }

    @Transactional
    public void updateCourse(Long id, CourseDto dto, MultipartFile video){
       CourseEntity course = courseRepository.findById(id)
               .orElseThrow(() -> new ResourceNotFoundException("Course not found."));

       course.setName(dto.getName());
       course.setDescription(dto.getDescription());
       course.setAmount(dto.getAmount());
       course.setCategory(dto.getCategory());
       course.setPublished(dto.isPublished());

       if(video != null && !video.isEmpty()){
           s3Service.deleteVideo(course.getVideoKey());
           String videoKey = s3Service.uploadVideo(video);
           course.setVideoKey(videoKey);
       }

       courseRepository.save(course);
    }

    @Transactional(readOnly = true)
    public Page<CourseResponseDto> getCourses(Pageable pageable) {
        Page<CourseEntity> coursePage = courseRepository.findAll(pageable);

        return coursePage.map(courseMapper::toDto);
    }

    @Transactional(readOnly = true)
    public Page<CourseResponseDto> getCourses(learn_vault.enums.Category category, String search, Pageable pageable) {
        Page<CourseEntity> coursePage;
        if (category == null && search == null) {
            coursePage = courseRepository.findAll(pageable);
        } else if (category != null && search == null) {
            coursePage = courseRepository.findByCategory(category, pageable);
        } else if (category == null && search != null) {
            coursePage = courseRepository.findBySearch(search, pageable);
        } else {
            coursePage = courseRepository.findByCategoryAndSearch(category, search, pageable);
        }
        return coursePage.map(courseMapper::toDto);
    }

    @Transactional(readOnly = true)
    public CourseResponseDto getCourse(Long id, UserEntity currentUser) {
        CourseEntity course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course with ID " + id + " not found"));

        boolean hasAccess = false;
        if (course.getAmount() == 0) {
            hasAccess = true;
        } else if (currentUser != null) {
            if (currentUser.getRole() == Role.ADMIN) {
                hasAccess = true;
            } else if (currentUser.getRole() == Role.AUTHOR) {
                hasAccess = (course.getAuthor() != null && course.getAuthor().getUser() != null &&
                             course.getAuthor().getUser().getId().equals(currentUser.getId()));
            } else {
                hasAccess = enrollmentRepository.existsByUser_IdAndCourse_Id(currentUser.getId(), id);
            }
        }

        return new CourseResponseDto(course, hasAccess);
    }

    @Transactional(readOnly = true)
    public List<CourseResponseDto> getEnrolledCourses(UserEntity currentUser) {
        if (currentUser == null) {
            throw new ResourceNotFoundException("User not authenticated");
        }
        return enrollmentRepository.findByUser_IdAndEnrollmentStatus(currentUser.getId(), EnrollmentStatus.ACTIVE)
                .stream()
                .map(enrollment -> new CourseResponseDto(enrollment.getCourse(), true))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CourseResponseDto> getAuthorCourses(UserEntity currentUser) {
        if (currentUser == null) {
            throw new ResourceNotFoundException("User not authenticated");
        }
        AuthorEntity author = authorRepository.findByUserId(currentUser.getId());
        if (author == null) {
            throw new ResourceNotFoundException("Author not found");
        }
        return courseRepository.findByAuthor_Id(author.getId())
                .stream()
                .map(course -> new CourseResponseDto(course, true))
                .toList();
    }
}
