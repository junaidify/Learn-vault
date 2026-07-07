package learn_vault.service;

import org.springframework.web.client.RestClient;
import org.springframework.stereotype.Service;
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

        Map response = restClient.post()
                .uri("/api/embeddings")
                .contentType(MediaType.APPLICATION_JSON)
                .body(request)
                .retrieve()
                .body(Map.class);

        return (List<Double>) response.get("embedding");
    }
}