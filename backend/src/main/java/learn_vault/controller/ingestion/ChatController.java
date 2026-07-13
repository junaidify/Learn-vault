package learn_vault.controller.ingestion;
import learn_vault.service.ragpipeline.ChatService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/chat")
public class ChatController {
    private final ChatService chatService;

    public ChatController(ChatService chatService){
        this.chatService = chatService;
    }

    @PostMapping("/{courseId}")
    public ResponseEntity<Map<String, String>> chat(@PathVariable Long courseId,
                                                    @RequestBody Map<String, String> request){
        String userMessage = request.get("message");
        String conversationIdStr = request.get("conversationId");   

        UUID conversationId = conversationIdStr != null ? UUID.fromString(conversationIdStr) : UUID.randomUUID();

        String answer = chatService.chat(courseId, conversationId, userMessage);

        return ResponseEntity.ok(Map.of(
                "message", answer,
                "conversationId", conversationId.toString()
        ));
    }

 
}
