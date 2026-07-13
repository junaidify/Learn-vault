package learn_vault.service.ragpipeline;

import java.util.Map;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class IngestService {
    private final JdbcClient jdbcClient;
    private final EmbeddingService embeddingService;

    public IngestService(JdbcClient jdbcClient, EmbeddingService embeddingService) {
        this.embeddingService = embeddingService;
        this.jdbcClient = jdbcClient;
    }

    public void ingestCourse(Long courseId) {
        Map<String, Object> course = jdbcClient.sql("""
                SELECT id, name, description FROM courses
                WHERE id = :courseId
                """)
                .param("courseId", courseId)
                .query()
                .singleRow();

        String name = (String) course.get("name");
        String description = (String) course.get("description");

        String content = "Course: " + name + "\nDescription: " + description;

        List<Double> embedding = embeddingService.embed(content);

        String vectorString = embedding.toString();

        jdbcClient.sql("""
                INSERT INTO course_chunks (id, course_id, content, embedding)
                VALUES (gen_random_uuid(), :courseId, :content, CAST(:embedding AS vector))
                """)
                .param("courseId", courseId)
                .param("content", content)
                .param("embedding", vectorString)
                .update();

    }

    public void ingestAllCourses() {
        List<Long> courseIds = jdbcClient.sql("SELECT id FROM courses")
                .query(Long.class)
                .list();

        courseIds.forEach(this::ingestCourse);
    }

}
