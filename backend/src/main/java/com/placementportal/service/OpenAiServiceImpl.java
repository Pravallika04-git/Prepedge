package com.placementportal.service;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

/**
 * OpenAI-compatible implementation of AiService.
 * Works with OpenAI, Azure OpenAI, or any compatible API.
 */
@Service
@RequiredArgsConstructor
public class OpenAiServiceImpl implements AiService {

    private static final Logger logger = LoggerFactory.getLogger(OpenAiServiceImpl.class);

    @Value("${app.ai.api-key}")
    private String apiKey;

    @Value("${app.ai.api-url}")
    private String apiUrl;

    @Value("${app.ai.model}")
    private String model;

    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public String chat(String userMessage, List<Map<String, String>> conversationHistory) {
        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content",
                "You are a helpful placement preparation assistant. Help students prepare for campus placements " +
                "by answering questions about aptitude, coding, HR interviews, and technical concepts."));

        if (conversationHistory != null) {
            messages.addAll(conversationHistory);
        }
        messages.add(Map.of("role", "user", "content", userMessage));

        return callApi(messages);
    }

    @Override
    public String analyzeResume(String resumeText) {
        List<Map<String, String>> messages = List.of(
                Map.of("role", "system", "content",
                        "You are an expert resume reviewer for campus placement preparation. " +
                        "Analyze the resume and provide: 1) Overall score (0-100), 2) Strengths, " +
                        "3) Weaknesses, 4) Specific suggestions for improvement, " +
                        "5) ATS compatibility score. Format your response as structured JSON."),
                Map.of("role", "user", "content", "Please analyze this resume:\n\n" + resumeText)
        );
        return callApi(messages);
    }

    @Override
    public String generateInterviewQuestions(String topic, String difficulty) {
        List<Map<String, String>> messages = List.of(
                Map.of("role", "system", "content",
                        "You are an expert interviewer for campus placements. Generate interview questions " +
                        "in JSON array format with fields: question, expectedKeyPoints, difficulty."),
                Map.of("role", "user", "content",
                        String.format("Generate 5 %s level interview questions on the topic: %s", difficulty, topic))
        );
        return callApi(messages);
    }

    @Override
    public String evaluateInterviewAnswer(String question, String answer, String topic) {
        List<Map<String, String>> messages = List.of(
                Map.of("role", "system", "content",
                        "You are an expert interviewer evaluating a candidate's answer. Provide: " +
                        "1) Score (0-10), 2) Feedback, 3) Model answer, 4) Areas to improve. " +
                        "Format as JSON."),
                Map.of("role", "user", "content",
                        String.format("Topic: %s\nQuestion: %s\nCandidate's Answer: %s", topic, question, answer))
        );
        return callApi(messages);
    }

    private String callApi(List<Map<String, String>> messages) {
        try {
            if (apiKey.equals("sk-placeholder")) {
                return generateMockResponse(messages);
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            Map<String, Object> body = new HashMap<>();
            body.put("model", model);
            body.put("messages", messages);
            body.put("max_tokens", 2000);
            body.put("temperature", 0.7);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    apiUrl + "/chat/completions", request, Map.class);

            if (response.getBody() != null) {
                List<Map<String, Object>> choices = (List<Map<String, Object>>) response.getBody().get("choices");
                if (choices != null && !choices.isEmpty()) {
                    Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                    return (String) message.get("content");
                }
            }
            return "I apologize, I couldn't generate a response. Please try again.";
        } catch (Exception e) {
            logger.error("AI API call failed: {}", e.getMessage());
            return generateMockResponse(messages);
        }
    }

    private String generateMockResponse(List<Map<String, String>> messages) {
        String lastMessage = messages.get(messages.size() - 1).get("content").toLowerCase();

        if (lastMessage.contains("resume") || lastMessage.contains("analyze")) {
            return "{\"score\": 72, \"strengths\": [\"Good technical skills section\", \"Clear project descriptions\"], " +
                   "\"weaknesses\": [\"Missing quantified achievements\", \"No summary statement\"], " +
                   "\"suggestions\": [\"Add metrics to project descriptions\", \"Include a professional summary\", " +
                   "\"Add relevant certifications\", \"Use action verbs\"], \"atsScore\": 68}";
        }

        if (lastMessage.contains("interview") && lastMessage.contains("question")) {
            return "[{\"question\": \"Explain the concept of OOP and its four pillars.\", \"expectedKeyPoints\": " +
                   "[\"Encapsulation\", \"Inheritance\", \"Polymorphism\", \"Abstraction\"], \"difficulty\": \"MEDIUM\"}," +
                   "{\"question\": \"What is the difference between an abstract class and an interface?\", " +
                   "\"expectedKeyPoints\": [\"Multiple inheritance\", \"Constructor\", \"Method implementation\"], " +
                   "\"difficulty\": \"MEDIUM\"}]";
        }

        if (lastMessage.contains("evaluate") || lastMessage.contains("score")) {
            return "{\"score\": 7, \"feedback\": \"Good understanding of core concepts with room for improvement in depth.\", " +
                   "\"modelAnswer\": \"A comprehensive answer would include...\", " +
                   "\"areasToImprove\": [\"Provide more examples\", \"Discuss edge cases\"]}";
        }

        return "I'm your placement preparation assistant! I can help you with:\n\n" +
               "📚 **Technical Concepts** - Data Structures, Algorithms, OOP, DBMS, OS\n" +
               "💼 **Interview Preparation** - HR questions, behavioral questions, technical interviews\n" +
               "📝 **Resume Review** - Upload your resume for AI-powered analysis\n" +
               "🧮 **Aptitude** - Quantitative, logical reasoning, verbal ability\n\n" +
               "What would you like to prepare for today?";
    }
}
