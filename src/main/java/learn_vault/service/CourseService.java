package learn_vault.service;

import learn_vault.dto.CourseDto;
import learn_vault.entities.AuthorEntity;
import learn_vault.entities.CourseEntity;
import learn_vault.repositories.AuthorRepository;
import learn_vault.repositories.CourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.Optional;

@Service
public class CourseService {
    @Autowired
    private CourseRepository courseRepository;
    @Autowired
    private AuthorRepository authorRepository;

    public String courseCreate(CourseDto dto) {
        Optional<AuthorEntity> authorOpt = authorRepository.findByAuthorName(dto.getAuthorName());

        AuthorEntity author;

        if(authorOpt.isEmpty()){
            author = authorRepository.save(new AuthorEntity(dto.getAuthorName()));
        }else{
            author = authorOpt.get();
        }

        List<CourseEntity> courseExistsList = courseRepository.findByAuthorId(author.getAuthorId());

        boolean isCourseExist = courseExistsList.stream().
                anyMatch(course -> course.getTitle().equals(dto.getTitle()));

        if(isCourseExist) return "Course already exist";

        courseRepository.save(new CourseEntity(dto.getTitle(), author.getAuthorId()));
        return "Course created successfully.";
    }
}