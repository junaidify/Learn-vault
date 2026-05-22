package learn_vault.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name="courses")
public class CourseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Add title of course")
    private String title;

    @ManyToOne
    @JoinColumn(name = "author_id")
    @NotNull(message = "Please add author name")
    private AuthorEntity author;

    protected CourseEntity(){};

    public CourseEntity(String title, AuthorEntity author){
        this.title = title;
        this.author = author;
    }

    public Long getId(){ return id; }
    public String getTitle(){ return title; }
    public AuthorEntity getAuthor(){ return author; }

    public void setTitle(String title){ this.title = title; }
    public void setAuthor(AuthorEntity author){ this.author = author; }

}
