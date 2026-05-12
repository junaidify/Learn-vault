package learn_vault.service;

import learn_vault.dto.CourseDto;
import learn_vault.entities.AuthorEntity;
import learn_vault.entities.CourseEntity;
import learn_vault.repositories.AuthorRepository;
import learn_vault.repositories.CourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CourseService {

    @Autowired
    private CourseRepository courseRepository;
    @Autowired
    private AuthorRepository authorRepository;

    public String courseCreate(CourseDto dto) {
        Optional<AuthorEntity> authorOpt = authorRepository.findByAuthorName(dto.getAuthorName());

        if (authorOpt.isPresent()) {
            AuthorEntity author = authorOpt.get(); // unwrap the entity

            List<CourseEntity> authorCourses = courseRepository.findByAuthorId(author.getId());

            boolean titleExists = authorCourses.stream()
                    .anyMatch(course -> course.getTitle().equals(dto.getTitle()));

            if (titleExists) {
                return "Course already exists with same title";
            } else {
                CourseEntity newCourse = new CourseEntity(
                        dto.getTitle(),
                        author // pass entity, not Optional
                );
                courseRepository.save(newCourse);
                return "Course created successfully";
            }

        } else {
            return "Author not found";
        }
    }
}