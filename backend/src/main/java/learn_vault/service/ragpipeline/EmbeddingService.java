package learn_vault.service.ragpipeline;

import org.springframework.web.client.RestClient;
import org.springframework.stereotype.Service;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import java.util.List;
import java.util.Map;

@Service
public class EmbeddingService{
    private final RestClient restClient;

    public EmbeddingService(){
        this.restClient = RestClient.create("http://localhost:11434");
    }

    public List<Double> embed(String text){
        Map<String, String> request = Map.of(
                "model", "nomic-embed-text",
                "prompt", text
        );

        Map<String, Object> response = restClient.post()
                .uri("/api/embeddings")
                .contentType(MediaType.APPLICATION_JSON)
                .body(request)
                .retrieve()
                .body(new ParameterizedTypeReference<Map<String, Object>>() {});

        return (List<Double>) response.get("embedding");
    }
}