package learn_vault.entity.course;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import learn_vault.entity.BaseEntity;
import learn_vault.entity.user.AuthorEntity;
import learn_vault.enums.Category;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name="courses")
public class CourseEntity extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Setter(AccessLevel.NONE)
    private Long id;

    @NotBlank(message = "Add title of course")
    private String name;

    @NotBlank(message = "Write something about course")
    @Column(columnDefinition = "TEXT")
    private String description;

    @Min(value = 0, message = "Price can't be negative. ")
    private Long amount;

    private String videoKey;

    @NotNull(message = "Choose any of them.")
    @Enumerated(EnumType.STRING)
    private Category category;

    @Getter(AccessLevel.NONE)
    private boolean published;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id")
    @NotNull(message = "Please add author name")
    private AuthorEntity author;

    protected CourseEntity(){};

    public CourseEntity(String name, String description, Long amount,
                        Category category, boolean published, AuthorEntity author, String videoKey){
        this.name = name;
        this.description = description;
        this.amount = amount;
        this.category = category;
        this.published = published;
        this.author = author;
        this.videoKey = videoKey;
    }

    public boolean getPublished(){ return published; }
}
