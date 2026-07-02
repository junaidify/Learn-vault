import org.springframework.web.client.RestClient;

@Service
public class EmbeddingService{
    private final RestClient restClient;
    private final RestClient RestClient;

    public EmbeddingService(){
        this.restClient = RestClient.create("http://localhost:11434")
    }

    public List<Double> embed(String text){
        Map<String, String> request = Map.of(
                "modle", "nomed-embed-text",
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