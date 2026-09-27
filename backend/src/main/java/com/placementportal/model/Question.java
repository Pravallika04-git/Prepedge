package com.placementportal.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "questions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    @Column(name = "question_text", nullable = false, columnDefinition = "TEXT")
    private String questionText;

    @Enumerated(EnumType.STRING)
    @Column(name = "question_type", nullable = false)
    private QuestionType questionType;

    @Column(name = "option_a")
    private String optionA;

    @Column(name = "option_b")
    private String optionB;

    @Column(name = "option_c")
    private String optionC;

    @Column(name = "option_d")
    private String optionD;

    @Column(name = "correct_answer", nullable = false)
    private String correctAnswer;

    @Column(columnDefinition = "TEXT")
    private String explanation;

    @Column(nullable = false)
    private Integer marks;

    @Column(name = "code_template", columnDefinition = "TEXT")
    private String codeTemplate;

    @Column(name = "test_cases", columnDefinition = "TEXT")
    private String testCases;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public enum QuestionType {
        MCQ, CODING, SHORT_ANSWER
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (marks == null) marks = 1;
        if (questionType == null) questionType = QuestionType.MCQ;
    }
}
