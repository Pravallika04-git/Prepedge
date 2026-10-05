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
        User user = authService.getCurrentUser();
        List<String> sessions = chatMessageRepository.findDistinctSessionIdsByUserId(user.getId());
        return ResponseEntity.ok(ApiResponse.success("Sessions retrieved", sessions));
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

    @PostMapping("/resume/analyze")
    public ResponseEntity<ApiResponse> analyzeResume(@RequestBody Map<String, String> request) {
        String resumeText = request.get("resumeText");
        String analysis = aiService.analyzeResume(resumeText);
        return ResponseEntity.ok(ApiResponse.success("Resume analyzed", Map.of("analysis", analysis)));
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
