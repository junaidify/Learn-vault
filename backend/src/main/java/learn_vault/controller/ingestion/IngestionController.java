package learn_vault.controller.ingestion;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.http.ResponseEntity;
import learn_vault.service.ragpipeline.IngestService;


@RestController
@RequestMapping("/api/ingest")
public class IngestionController {
    private final IngestService ingestService;

    public IngestionController(IngestService ingestService){
        this.ingestService = ingestService;
    }

    @PostMapping("/{courseId}")
    public ResponseEntity<String> ingestCourse(@PathVariable Long courseId) {
        ingestService.ingestCourse(courseId);
        return ResponseEntity.ok("Course ingested successfully");
    }

    @PostMapping("/all")
    public ResponseEntity<String> ingestAll() {
        ingestService.ingestAllCourses();
        return ResponseEntity.ok("All courses ingested successfully");
    }
}