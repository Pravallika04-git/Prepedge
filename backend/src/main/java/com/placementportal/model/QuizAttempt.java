package com.placementportal.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "quiz_attempts")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class QuizAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    private Integer score;

    @Column(name = "total_marks")
    private Integer totalMarks;

    private Double percentage;

    @Column(name = "time_taken_seconds")
    private Integer timeTakenSeconds;

    @Enumerated(EnumType.STRING)
    private AttemptStatus status;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    public enum AttemptStatus {
        IN_PROGRESS, COMPLETED, ABANDONED
    }

    @PrePersist
    protected void onCreate() {
        startedAt = LocalDateTime.now();
        if (status == null) status = AttemptStatus.IN_PROGRESS;
        if (score == null) score = 0;
        if (totalMarks == null) totalMarks = 0;
        if (percentage == null) percentage = 0.0;
    }
}
