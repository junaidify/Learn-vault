package learn_vault.service.ragpipeline;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VectorSearchService {
    private final JdbcClient jdbcClient;

    public VectorSearchService(JdbcClient jdbcClient){
        this.jdbcClient = jdbcClient;
    }

    public List<String> findRevelantChunks(Long courseId, List<Double> questionVector){
        String vectorString = questionVector.toString();

        return jdbcClient.sql("""
                SELECT content FROM course_chunks
                WHERE course_id = :courseId
                ORDER BY embedding <=> CAST(:embedding AS vector)
                LIMIT 5;
                """)
                .param("courseId", courseId)
                .param("embedding", vectorString)
                .query(String.class)
                .list();

    }
}
