package learn_vault.service;

import learn_vault.dto.CourseDto;
import learn_vault.entities.AuthorEntity;
import learn_vault.entities.CourseEntity;
import learn_vault.repositories.AuthorRepository;
import learn_vault.repositories.CourseRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.Optional;

@Service
public class CourseService {
   private final CourseRepository courseRepository;
   private final AuthorRepository authorRepository;

   public CourseService(CourseRepository courseRepository, AuthorRepository authorRepository){
       this.authorRepository = authorRepository;
       this.courseRepository = courseRepository;
   }

    public String courseCreate(CourseDto dto) {
        Optional<AuthorEntity> authorOpt = authorRepository.findByAuthorName(dto.getAuthorName());

        AuthorEntity author = authorOpt.orElseGet(() -> authorRepository.save( new AuthorEntity(dto.getAuthorName())));

        List<CourseEntity> courseExistsList = courseRepository.findByAuthor_AuthorId(author.getAuthorId());

        boolean isCourseExist = courseExistsList.stream().
                anyMatch(course -> course.getTitle().equals(dto.getTitle()));

        if(isCourseExist) return "Course already exist";

        courseRepository.save(new CourseEntity(dto.getTitle(), author));
        return "Course created successfully.";
    }

    public List<CourseEntity> getCourses() {
        List<CourseEntity> courses = courseRepository.findAll();

        return courses.isEmpty() ? Collections.emptyList() : courses;
    }

    public Optional<CourseEntity> getCourse(Long id){
       return courseRepository.findById(id);
    }
}