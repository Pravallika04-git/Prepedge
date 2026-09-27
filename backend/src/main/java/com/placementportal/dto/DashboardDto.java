package com.placementportal.dto;

import lombok.*;
import java.util.List;

public class DashboardDto {

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class StudentDashboard {
        private long quizzesAttempted;
        private long quizzesAvailable;
        private Double averageScore;
        private long interviewsCompleted;
        private long resumeAnalyses;
        private List<RecentActivity> recentActivities;
        private List<CategoryScore> categoryScores;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class AdminDashboard {
        private long totalStudents;
        private long totalQuizzes;
        private long totalAttempts;
        private long totalInterviews;
        private List<RecentActivity> recentActivities;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class RecentActivity {
        private String type;
        private String title;
        private String description;
        private String timestamp;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class CategoryScore {
        private String category;
        private Double averageScore;
        private long attempts;
    }
}
