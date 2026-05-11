package learn_vault.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

@Entity
@Table(name="courses",
uniqueConstraints = {
        @UniqueConstraint(columnNames = "title")
})
public class CourseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @NotBlank(message = "Add title of course")
    private String title;

    @NotEmpty(message = "Please add author name")
    private String authorId;

    protected CourseEntity(){};

    public CourseEntity(String title, String authorId){
        this.title = title;
        this.authorId = authorId;
    }

    public Long getId(){ return id; }
    public String getTitle(){ return title; }
    public String getAuthorId(){ return authorId; }

    public void setTitle(String title){ this.title = title; }
    public void setAuthorId(String authorId){ this.authorId = authorId; }

}
