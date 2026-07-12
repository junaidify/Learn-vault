package learn_vault.controller;
import learn_vault.service.ragpipeline.ChatService;
import learn_vault.service.ragpipeline.IngestService;

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
    private final IngestService ingestService;

    public ChatController(ChatService chatService, IngestService ingestService){
        this.chatService = chatService;
        this.ingestService = ingestService;
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

    @PostMapping("/ingest/{courseId}")
    public ResponseEntity<String> ingestCourse(@PathVariable Long courseId){
        ingestService.ingestCourse(courseId);
        return ResponseEntity.ok("Course ingested successfully");
    }

    @PostMapping("/ingest/courses/all")
    public ResponseEntity<String> ingestAllCourse(){
        ingestService.ingestAllCourses();
        return ResponseEntity.ok("All courses ingested successfully");
    }
}
