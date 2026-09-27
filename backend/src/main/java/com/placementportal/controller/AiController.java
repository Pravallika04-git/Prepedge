package com.placementportal.controller;

import com.placementportal.dto.ApiResponse;
import com.placementportal.model.ChatMessage;
import com.placementportal.model.User;
import com.placementportal.repository.ChatMessageRepository;
import com.placementportal.service.AiService;
import com.placementportal.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;
    private final AuthService authService;
    private final ChatMessageRepository chatMessageRepository;

    @PostMapping("/chat")
    public ResponseEntity<ApiResponse> chat(@RequestBody Map<String, String> request) {
        User user = authService.getCurrentUser();
        String message = request.get("message");
        String sessionId = request.getOrDefault("sessionId", UUID.randomUUID().toString());

        // Save user message
        chatMessageRepository.save(ChatMessage.builder()
                .user(user)
                .sessionId(sessionId)
                .role(ChatMessage.MessageRole.USER)
                .content(message)
                .build());

        // Get conversation history
        List<ChatMessage> history = chatMessageRepository.findBySessionIdOrderByCreatedAtAsc(sessionId);
        List<Map<String, String>> conversationHistory = history.stream()
                .map(msg -> Map.of(
                        "role", msg.getRole() == ChatMessage.MessageRole.USER ? "user" : "assistant",
                        "content", msg.getContent()))
                .collect(Collectors.toList());

        // Get AI response
        String aiResponse = aiService.chat(message, conversationHistory);

        // Save AI response
        chatMessageRepository.save(ChatMessage.builder()
                .user(user)
                .sessionId(sessionId)
                .role(ChatMessage.MessageRole.ASSISTANT)
                .content(aiResponse)
                .build());

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
    public ResponseEntity<ApiResponse> evaluateAnswer(@RequestBody Map<String, String> request) {
        String question = request.get("question");
        String answer = request.get("answer");
        String topic = request.get("topic");
        String evaluation = aiService.evaluateInterviewAnswer(question, answer, topic);
        return ResponseEntity.ok(ApiResponse.success("Answer evaluated", Map.of("evaluation", evaluation)));
    }
}
