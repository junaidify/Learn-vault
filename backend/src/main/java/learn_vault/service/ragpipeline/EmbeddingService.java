package learn_vault.service.ragpipeline;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Service
public class EmbeddingService {
    private final RestClient restClient;

    public EmbeddingService(@Value("${NVIDIA_API_KEY:}") String apiKey) {
        this.restClient = RestClient.builder()
                .baseUrl("https://integrate.api.nvidia.com/v1")
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .build();
    }

    public List<Double> embed(String text, String inputType) {
        Map<String, Object> request = Map.of(
                "input", List.of(text),
                "model", "nvidia/llama-nemotron-embed-1b-v2",
                "dimensions", 768,
                "input_type", inputType
        );

        Map<String, Object> response = restClient.post()
                .uri("/embeddings")
                .contentType(MediaType.APPLICATION_JSON)
                .body(request)
                .retrieve()
                .body(new ParameterizedTypeReference<Map<String, Object>>() {});

        List<Map<String, Object>> data = (List<Map<String, Object>>) response.get("data");
        Map<String, Object> dataItem = data.get(0);
        return (List<Double>) dataItem.get("embedding");
    }
}