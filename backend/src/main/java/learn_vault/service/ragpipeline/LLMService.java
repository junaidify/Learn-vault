package learn_vault.service.ragpipeline;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Service
public class LLMService {
    private final RestClient restClient;

    public LLMService(){
        this.restClient = RestClient.create("http://localhost:11434");
    }

    public String chat(String systemPrompt, String userMessage){
        Map<String, Object> request = Map.of(
                "model", "qwen3.5:4b",
                "messages",  List.of(
                        "role", "system", "content", systemPrompt,
                        "role", "user", "content", userMessage
                ),
                "stream", false
        );


        Map<String, Object> response = restClient.post()
                .uri("/api/chat")
                .contentType(MediaType.APPLICATION_JSON)
                .body(request)
                .retrieve()
                .body(new ParameterizedTypeReference<Map<String, Object>>() {});


        Map<String, Object> message = (Map<String, Object>) response.get("message");
        return (String) message.get("content");
    }
}
