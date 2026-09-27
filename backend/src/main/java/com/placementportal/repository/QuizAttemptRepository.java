package com.placementportal.repository;

import com.placementportal.model.QuizAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {
    List<QuizAttempt> findByUserIdOrderByStartedAtDesc(Long userId);
    List<QuizAttempt> findByQuizId(Long quizId);
    List<QuizAttempt> findByUserIdAndQuizId(Long userId, Long quizId);
    long countByUserId(Long userId);

    @Query("SELECT AVG(qa.percentage) FROM QuizAttempt qa WHERE qa.user.id = :userId AND qa.status = 'COMPLETED'")
    Double findAverageScoreByUserId(Long userId);

    @Query("SELECT COUNT(DISTINCT qa.quiz.id) FROM QuizAttempt qa WHERE qa.user.id = :userId")
    long countDistinctQuizzesByUserId(Long userId);
}
