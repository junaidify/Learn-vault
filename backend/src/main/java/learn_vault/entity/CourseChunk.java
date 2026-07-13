package learn_vault.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "course_chunk")
@Getter
@Setter
public class CourseChunk {

   @Id
   @GeneratedValue(strategy = GenerationType.UUID)
   private UUID id;

   @Column(name = "course_id", nullable = false)
   private Long courseId;

   @Column(columnDefinition = "TEXT", nullable = false)
   private String content;

   @Column(columnDefinition = "vector(768)")
   private String embedding;

   private LocalDateTime createdAt = LocalDateTime.now();

}