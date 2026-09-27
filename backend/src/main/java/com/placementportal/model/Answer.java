package com.placementportal.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "answers")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Answer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attempt_id", nullable = false)
    private QuizAttempt attempt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @Column(name = "selected_answer", columnDefinition = "TEXT")
    private String selectedAnswer;

    @Column(name = "is_correct")
    private Boolean isCorrect;

    @Column(name = "marks_awarded")
    private Integer marksAwarded;

    @Column(name = "code_output", columnDefinition = "TEXT")
    private String codeOutput;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (isCorrect == null) isCorrect = false;
        if (marksAwarded == null) marksAwarded = 0;
    }
}
