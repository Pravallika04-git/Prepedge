package com.placementportal.service;

import com.placementportal.dto.DashboardDto;
import com.placementportal.model.User;
import com.placementportal.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final QuizRepository quizRepository;
    private final QuizAttemptRepository attemptRepository;
    private final MockInterviewRepository interviewRepository;
    private final ResumeAnalysisRepository resumeRepository;
    private final UserRepository userRepository;
    private final AuthService authService;

    public DashboardDto.StudentDashboard getStudentDashboard() {
        User user = authService.getCurrentUser();
        Long userId = user.getId();

        Double avgScore = attemptRepository.findAverageScoreByUserId(userId);

        return DashboardDto.StudentDashboard.builder()
                .quizzesAttempted(attemptRepository.countDistinctQuizzesByUserId(userId))
                .quizzesAvailable(quizRepository.findByIsActiveTrue().size())
                .averageScore(avgScore != null ? avgScore : 0.0)
                .interviewsCompleted(interviewRepository.countByUserId(userId))
                .resumeAnalyses(resumeRepository.findByUserIdOrderByCreatedAtDesc(userId).size())
                .recentActivities(new ArrayList<>())
                .categoryScores(new ArrayList<>())
                .build();
    }

    public DashboardDto.AdminDashboard getAdminDashboard() {
        return DashboardDto.AdminDashboard.builder()
                .totalStudents(userRepository.countByRole(User.Role.STUDENT))
                .totalQuizzes(quizRepository.count())
                .totalAttempts(attemptRepository.count())
                .totalInterviews(interviewRepository.count())
                .recentActivities(new ArrayList<>())
                .build();
    }
}
