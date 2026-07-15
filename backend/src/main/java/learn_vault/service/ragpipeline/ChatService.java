package learn_vault.service.ragpipeline;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;
import learn_vault.entity.ChatMessageEntity;
import learn_vault.repository.ChatMessageRepository;

import java.util.List;
import java.util.UUID;

@Service
public class ChatService {
    private final EmbeddingService embeddingService;
    private final VectorSearchService vectorSearchService;
    private final LLMService llmService;
    private final JdbcClient jdbcClient;
    private final ChatMessageRepository chatMessageRepository;

    public ChatService(EmbeddingService embeddingService, VectorSearchService vectorSearchService,
                       LLMService llmService, JdbcClient jdbcClient, ChatMessageRepository chatMessageRepository){
        this.embeddingService = embeddingService;
        this.vectorSearchService = vectorSearchService;
        this.llmService = llmService;
        this.jdbcClient = jdbcClient;
        this.chatMessageRepository = chatMessageRepository;
    }

    public String chat(Long courseId, UUID conversationId, String userMessage){
        List<Double> questionVector = embeddingService.embed(userMessage);
        List<String> chunks = vectorSearchService.findRevelantChunks(courseId, questionVector);

        List<String> history = jdbcClient.sql("""
                SELECT role || ': ' || content FROM chat_messages
                WHERE conversation_id = :conversationId
                ORDER BY created_at ASC
                LIMIT 8
                """)
                .param("conversationId", conversationId)
                .query(String.class)
                .list();

        String context = String.join("\n", chunks);
        String chatHistory = String.join("\n", history);

        String systemPrompt = """
                You are a helpful course assistant. Answer the user's question about the course.
                Prefer using the provided context to answer. If the context contains placeholder/lorem-ipsum text or does not directly answer the question, use your general knowledge of the course topic (indicated by the course name in the context) to provide a friendly, educational, and comprehensive response.
                """;

        String userPrompt = """
                CONTEXT:
                
                %s
                
                CHAT HISTORY
                
                %s
                
                QUESTION
                %s
                """.formatted(context, chatHistory, userMessage);

        String answer = llmService.chat(systemPrompt, userPrompt);

        chatMessageRepository.save(new ChatMessageEntity(conversationId, courseId, "user", userMessage));
        chatMessageRepository.save(new ChatMessageEntity(conversationId, courseId, "assistant", answer));

        return answer;

    }
}
