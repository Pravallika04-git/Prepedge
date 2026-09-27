package com.placementportal.dto;

import lombok.*;
import java.util.List;

public class QuizDto {

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class QuizRequest {
        private String title;
        private String description;
        private String category;
        private String difficulty;
        private Integer durationMinutes;
        private List<QuestionRequest> questions;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class QuestionRequest {
        private String questionText;
        private String questionType;
        private String optionA;
        private String optionB;
        private String optionC;
        private String optionD;
        private String correctAnswer;
        private String explanation;
        private Integer marks;
        private String codeTemplate;
        private String testCases;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class QuizResponse {
        private Long id;
        private String title;
        private String description;
        private String category;
        private String difficulty;
        private Integer durationMinutes;
        private Integer totalMarks;
        private Integer questionCount;
        private Boolean isActive;
        private String createdBy;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class QuestionResponse {
        private Long id;
        private String questionText;
        private String questionType;
        private String optionA;
        private String optionB;
        private String optionC;
        private String optionD;
        private Integer marks;
        private String codeTemplate;
        // Note: correctAnswer excluded for student view
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class SubmitAnswerRequest {
        private Long questionId;
        private String selectedAnswer;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class SubmitQuizRequest {
        private Long quizId;
        private List<SubmitAnswerRequest> answers;
        private Integer timeTakenSeconds;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class QuizResultResponse {
        private Long attemptId;
        private String quizTitle;
        private Integer score;
        private Integer totalMarks;
        private Double percentage;
        private Integer timeTakenSeconds;
        private List<AnswerResultResponse> answers;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class AnswerResultResponse {
        private Long questionId;
        private String questionText;
        private String selectedAnswer;
        private String correctAnswer;
        private Boolean isCorrect;
        private Integer marksAwarded;
        private String explanation;
    }
}
