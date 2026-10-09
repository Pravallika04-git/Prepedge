package com.placementportal.controller;

import com.placementportal.dto.ApiResponse;
import com.placementportal.model.ChatMessage;
import com.placementportal.model.User;
import com.placementportal.repository.ChatMessageRepository;
import com.placementportal.service.AiService;
import com.placementportal.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private static final Logger logger = LoggerFactory.getLogger(AiController.class);

    private final AiService aiService;
    private final AuthService authService;
    private final ChatMessageRepository chatMessageRepository;

    @PostMapping("/chat")
    public ResponseEntity<ApiResponse> chat(@RequestBody Map<String, String> request) {
        String message = request.get("message");

        // Input validation
        if (message == null || message.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Please enter a question."));
        }
        message = message.trim();

        String sessionId = request.getOrDefault("sessionId", UUID.randomUUID().toString());
        if (sessionId == null || sessionId.trim().isEmpty()) {
            sessionId = UUID.randomUUID().toString();
        }

        // Get AI response FIRST — this always works (mock fallback guarantees it)
        String aiResponse;
        try {
            // Try to get conversation history for context
            List<ChatMessage> history = chatMessageRepository.findBySessionIdOrderByCreatedAtAsc(sessionId);
            List<Map<String, String>> conversationHistory = history.stream()
                    .map(msg -> Map.of(
                            "role", msg.getRole() == ChatMessage.MessageRole.USER ? "user" : "assistant",
                            "content", msg.getContent()))
                    .collect(Collectors.toList());
            aiResponse = aiService.chat(message, conversationHistory);
        } catch (Exception e) {
            logger.warn("Could not load conversation history (DB may be unavailable): {}", e.getMessage());
            // Still call AI without history — mock fallback always works
            aiResponse = aiService.chat(message, null);
        }

        // Persist messages — best-effort (failure here must not block the response)
        try {
            User user = authService.getCurrentUser();
            final String finalSessionId = sessionId;
            final String finalMessage = message;
            final String finalResponse = aiResponse;

            chatMessageRepository.save(ChatMessage.builder()
                    .user(user)
                    .sessionId(finalSessionId)
                    .role(ChatMessage.MessageRole.USER)
                    .content(finalMessage)
                    .build());

            chatMessageRepository.save(ChatMessage.builder()
                    .user(user)
                    .sessionId(finalSessionId)
                    .role(ChatMessage.MessageRole.ASSISTANT)
                    .content(finalResponse)
                    .build());
        } catch (Exception e) {
            // Log but do NOT fail — the student still gets their answer
            logger.warn("Chat messages not persisted (DB may be unavailable): {}", e.getMessage());
        }

        Map<String, String> responseData = new HashMap<>();
        responseData.put("response", aiResponse);
        responseData.put("sessionId", sessionId);

        return ResponseEntity.ok(ApiResponse.success("Response generated", responseData));
    }


    @GetMapping("/chat/sessions")
    public ResponseEntity<ApiResponse> getChatSessions() {
        try {
            User user = authService.getCurrentUser();
            if (user == null || user.getId() == null) {
                return ResponseEntity.ok(ApiResponse.success("Sessions retrieved", Collections.emptyList()));
            }
            List<String> sessions = chatMessageRepository.findDistinctSessionIdsByUserId(user.getId());
            return ResponseEntity.ok(ApiResponse.success("Sessions retrieved", sessions != null ? sessions : Collections.emptyList()));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.success("Sessions retrieved", Collections.emptyList()));
        }
    }

    @GetMapping("/chat/history/{sessionId}")
    public ResponseEntity<ApiResponse> getChatHistory(@PathVariable String sessionId) {
        List<ChatMessage> messages = chatMessageRepository.findBySessionIdOrderByCreatedAtAsc(sessionId);
        List<Map<String, String>> history = messages.stream()
                .map(msg -> Map.of(
                        "role", msg.getRole().name(),
                        "content", msg.getContent(),
                        "timestamp", msg.getCreatedAt().toString()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Chat history retrieved", history));
    }

    @PostMapping(value = "/resume/extract-text", consumes = "multipart/form-data")
    public ResponseEntity<ApiResponse> extractResumeText(@RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Please upload a file."));
        }

        try {
            String extracted = extractTextFromFile(file);
            if (extracted == null || extracted.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Could not extract readable text from this file. Please ensure it contains selectable text, or paste your resume text manually."));
            }

            return ResponseEntity.ok(ApiResponse.success("Text extracted successfully", Map.of(
                    "text", extracted.trim(),
                    "filename", file.getOriginalFilename() != null ? file.getOriginalFilename() : "resume"
            )));
        } catch (Exception e) {
            logger.error("Failed to extract text from file: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to read file: " + e.getMessage()));
        }
    }

    @PostMapping(value = "/resume/analyze", consumes = {"application/json", "application/octet-stream"})
    public ResponseEntity<ApiResponse> analyzeResumeJson(@RequestBody(required = false) Map<String, String> request) {
        String resumeText = request != null ? request.get("resumeText") : null;
        return doAnalyzeResume(resumeText);
    }

    @PostMapping(value = "/resume/analyze", consumes = "multipart/form-data")
    public ResponseEntity<ApiResponse> analyzeResumeFile(
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "resumeText", required = false) String resumeText) {
        String textToAnalyze = resumeText;
        if ((textToAnalyze == null || textToAnalyze.trim().isEmpty()) && file != null && !file.isEmpty()) {
            try {
                textToAnalyze = extractTextFromFile(file);
            } catch (Exception e) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Could not read uploaded resume file: " + e.getMessage()));
            }
        }
        return doAnalyzeResume(textToAnalyze);
    }

    private ResponseEntity<ApiResponse> doAnalyzeResume(String resumeText) {
        if (resumeText == null || resumeText.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Please provide your resume content to analyze."));
        }

        resumeText = resumeText.trim();
        ValidationResult validation = validateResumeRules(resumeText);
        if (!validation.isValid()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(validation.getReason()));
        }

        String analysis = aiService.analyzeResume(resumeText);
        if (analysis != null) {
            String clean = analysis.trim();
            if (clean.startsWith("```")) {
                clean = clean.replaceAll("^```(?:json)?\\s*", "").replaceAll("\\s*```$", "").trim();
            }
            if (clean.contains("\"isResume\": false") || clean.contains("\"isResume\":false")) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("The submitted content does not qualify as a resume. Please make sure to include sections such as Education, Technical Skills, Projects, and Experience."));
            }
            return ResponseEntity.ok(ApiResponse.success("Resume analyzed", Map.of("analysis", clean)));
        }

        return ResponseEntity.badRequest()
                .body(ApiResponse.error("Could not analyze resume. Please try again."));
    }

    private String extractTextFromFile(MultipartFile file) throws Exception {
        if (file == null || file.isEmpty()) {
            return null;
        }

        String originalFilename = file.getOriginalFilename();
        String lowerName = (originalFilename != null) ? originalFilename.toLowerCase() : "";

        if (lowerName.endsWith(".pdf") || "application/pdf".equalsIgnoreCase(file.getContentType())) {
            try (InputStream is = file.getInputStream();
                 PDDocument document = PDDocument.load(is)) {
                PDFTextStripper stripper = new PDFTextStripper();
                stripper.setSortByPosition(true);
                return stripper.getText(document);
            }
        } else if (lowerName.endsWith(".docx")) {
            try (java.util.zip.ZipInputStream zis = new java.util.zip.ZipInputStream(file.getInputStream())) {
                java.util.zip.ZipEntry entry;
                while ((entry = zis.getNextEntry()) != null) {
                    if ("word/document.xml".equals(entry.getName())) {
                        byte[] bytes = zis.readAllBytes();
                        String xml = new String(bytes, StandardCharsets.UTF_8);
                        return xml.replaceAll("<[^>]+>", " ").replaceAll("\\s+", " ").trim();
                    }
                }
            }
        }

        return new String(file.getBytes(), StandardCharsets.UTF_8);
    }

    private ValidationResult validateResumeRules(String text) {
        if (text.length() < 100) {
            return new ValidationResult(false, "The provided text is too short to be a valid resume (minimum 100 characters required).");
        }

        String lower = text.toLowerCase();

        boolean hasEducation = lower.matches("(?s).*\\b(education|degree|b\\.?tech|b\\.?e|m\\.?tech|m\\.?e|bca|mca|bachelor|master|university|college|school|cgpa|gpa|percentage|academics|diploma|matriculation|intermediate)\\b.*");
        boolean hasSkills = lower.matches("(?s).*\\b(skills|technical skills|technologies|programming|languages|frameworks|tools|competencies|proficiencies|database|tech stack|libraries|developer)\\b.*");
        boolean hasProjects = lower.matches("(?s).*\\b(experience|work experience|employment|internship|intern|projects|project|responsibilities|contributions|developed|implemented|designed|built)\\b.*");
        boolean hasContact = lower.matches("(?s).*\\b(email|phone|mobile|contact|linkedin|github|portfolio|summary|objective|profile)\\b.*") || lower.contains("@");

        int categoryCount = (hasEducation ? 1 : 0) + (hasSkills ? 1 : 0) + (hasProjects ? 1 : 0) + (hasContact ? 1 : 0);

        if (categoryCount < 2) {
            return new ValidationResult(false, "The uploaded text does not meet resume criteria. A resume must contain at least 2 standard sections such as Education, Technical Skills, Projects, or Experience.");
        }

        return new ValidationResult(true, null);
    }

    private static class ValidationResult {
        private final boolean valid;
        private final String reason;

        public ValidationResult(boolean valid, String reason) {
            this.valid = valid;
            this.reason = reason;
        }

        public boolean isValid() { return valid; }
        public String getReason() { return reason; }
    }

    @PostMapping("/interview/questions")
    public ResponseEntity<ApiResponse> generateInterviewQuestions(@RequestBody Map<String, String> request) {
        String topic = request.get("topic");
        String difficulty = request.getOrDefault("difficulty", "MEDIUM");
        String questions = aiService.generateInterviewQuestions(topic, difficulty);
        return ResponseEntity.ok(ApiResponse.success("Questions generated", Map.of("questions", questions)));
    }

    @PostMapping("/interview/evaluate")
    public ResponseEntity<ApiResponse> evaluateAnswer(@RequestBody(required = false) Map<String, String> request) {
        String question = request != null ? request.getOrDefault("question", "") : "";
        String answer = request != null ? request.getOrDefault("answer", "") : "";
        String topic = request != null ? request.getOrDefault("topic", "General") : "General";
        String evaluation = aiService.evaluateInterviewAnswer(question, answer, topic);
        return ResponseEntity.ok(ApiResponse.success("Answer evaluated", Map.of("evaluation", evaluation)));
    }
}
