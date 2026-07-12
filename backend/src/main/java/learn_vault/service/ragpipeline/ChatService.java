package learn_vault.service.ragpipeline;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class ChatService {
    private final EmbeddingService embeddingService;
    private final VectorSearchService vectorSearchService;
    private final LLMService llmService;
    private final JdbcClient jdbcClient;

    public ChatService(EmbeddingService embeddingService, VectorSearchService vectorSearchService,
                       LLMService llmService, JdbcClient jdbcClient){
        this.embeddingService = embeddingService;
        this.vectorSearchService = vectorSearchService;
        this.llmService = llmService;
        this.jdbcClient = jdbcClient;
    }

    public String chat(Long courseId, UUID conversationId, String userMessage){
        List<Double> questionVector = embeddingService.embed(userMessage);
        List<String> chunks = vectorSearchService.findRevelantChunks(courseId, questionVector);

        List<String> history = jdbcClient.sql("""
                SELECT role || :  || content FROM chat_messages
                WHERE conversation_id = :conversationId
                ORDER BY created_at ASC
                LIMIT 8
                """)
                .param(":conversationId", conversationId)
                .query(String.class)
                .list();

        String context = String.join("\n" + chunks);
        String chatHistory = String.join("\n" + history);

        String systemPrompt = "You are a helpful course assistant. Answer only using the context provided. If the answer is not in the context, say you don't know.";

        String userPrompt = """
                CONTEXT:
                
                %s
                
                CHAT HISTORY
                
                %s
                
                QUESTION
                %s
                """.formatted(context, chatHistory, systemPrompt);

        String answer = llmService.chat(systemPrompt, userPrompt);

        jdbcClient.sql("""
                INSERT INTO chat_messages(id, conversation_id, course_id, role, content)
                VALUES(gen_random.UUID(), :conversationId, :courseId, :role, :content)
                """)
                .param(":conversationId", conversationId)
                .param(":courseId", courseId)
                .param(":role", "user")
                .param(":content", userMessage)
                .update();

        jdbcClient.sql("""
                INSERT INTO chat_messages(id, conversation_id, course_id, role, content)
                VALUES(gen_random.UUID(), :conversationId, :courseId, :role, :content)
                """)
                .param(":conversationId", conversationId)
                .param(":courseId", courseId)
                .param(":role", "assistant")
                .param(":content", answer)
                .update();

        return answer;

    }
}
