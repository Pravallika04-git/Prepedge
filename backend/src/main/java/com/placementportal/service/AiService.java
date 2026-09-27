package com.placementportal.service;

import java.util.List;
import java.util.Map;

/**
 * Pluggable AI service interface.
 * Implementations can target OpenAI, Claude, or any other LLM API.
 */
public interface AiService {

    /**
     * Send a chat message and get a response.
     */
    String chat(String userMessage, List<Map<String, String>> conversationHistory);

    /**
     * Analyze a resume text and return feedback.
     */
    String analyzeResume(String resumeText);

    /**
     * Generate interview questions for a given topic and difficulty.
     */
    String generateInterviewQuestions(String topic, String difficulty);

    /**
     * Evaluate an interview answer.
     */
    String evaluateInterviewAnswer(String question, String answer, String topic);
}
