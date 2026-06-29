package learn_vault.service;

import learn_vault.dto.request.CourseDto;
import learn_vault.dto.response.CourseResponseDto;
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
    private final CourseMapper courseMapper;
    private final S3Service s3Service;

    public CourseService(CourseRepository courseRepository,AuthorRepository authorRepository,
                         UserRepository userRepository,CourseMapper courseMapper, S3Service s3Service) {
        this.courseRepository = courseRepository;
        this.authorRepository = authorRepository;
        this.userRepository = userRepository;
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

        courseRepository.deletebyId(id);
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
    public CourseResponseDto getCourse(Long id, UserEntity currentUser) {
        CourseEntity course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course with ID " + id + " not found"));

        boolean hasAccess = currentUser != null && courseRepository.existsByUserIdAndCourseIdAndStatus(
             currentUser.getId(), id, EnrollmentStatus.ACTIVE.toString());

        return new CourseResponseDto(course, hasAccess);
    }
}
