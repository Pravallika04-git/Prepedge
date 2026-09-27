package com.placementportal.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "mock_interviews")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MockInterview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String topic;

    @Enumerated(EnumType.STRING)
    private Quiz.Difficulty difficulty;

    @Column(name = "questions_json", columnDefinition = "TEXT")
    private String questionsJson;

    @Column(name = "answers_json", columnDefinition = "TEXT")
    private String answersJson;

    @Column(name = "evaluation_json", columnDefinition = "TEXT")
    private String evaluationJson;

    @Column(name = "overall_score")
    private Integer overallScore;

    @Enumerated(EnumType.STRING)
    private InterviewStatus status;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    public enum InterviewStatus {
        IN_PROGRESS, COMPLETED
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) status = InterviewStatus.IN_PROGRESS;
    }
}
