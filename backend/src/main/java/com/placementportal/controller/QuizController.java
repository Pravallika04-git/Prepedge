package com.placementportal.controller;

import com.placementportal.dto.ApiResponse;
import com.placementportal.dto.QuizDto;
import com.placementportal.service.QuizService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/quizzes")
@RequiredArgsConstructor
public class QuizController {

    private final QuizService quizService;

    @GetMapping
    public ResponseEntity<ApiResponse> getAllQuizzes() {
        List<QuizDto.QuizResponse> quizzes = quizService.getAllActiveQuizzes();
        return ResponseEntity.ok(ApiResponse.success("Quizzes retrieved", quizzes));
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<ApiResponse> getByCategory(@PathVariable String category) {
        List<QuizDto.QuizResponse> quizzes = quizService.getQuizzesByCategory(category);
        return ResponseEntity.ok(ApiResponse.success("Quizzes retrieved", quizzes));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> getQuiz(@PathVariable Long id) {
        QuizDto.QuizResponse quiz = quizService.getQuizById(id);
        return ResponseEntity.ok(ApiResponse.success("Quiz retrieved", quiz));
    }

    @GetMapping("/{id}/questions")
    public ResponseEntity<ApiResponse> getQuestions(@PathVariable Long id) {
        List<QuizDto.QuestionResponse> questions = quizService.getQuizQuestions(id);
        return ResponseEntity.ok(ApiResponse.success("Questions retrieved", questions));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> createQuiz(@RequestBody QuizDto.QuizRequest request) {
        QuizDto.QuizResponse quiz = quizService.createQuiz(request);
        return ResponseEntity.ok(ApiResponse.success("Quiz created", quiz));
    }

    @PostMapping("/submit")
    public ResponseEntity<ApiResponse> submitQuiz(@RequestBody QuizDto.SubmitQuizRequest request) {
        QuizDto.QuizResultResponse result = quizService.submitQuiz(request);
        return ResponseEntity.ok(ApiResponse.success("Quiz submitted", result));
    }

    @GetMapping("/attempts")
    public ResponseEntity<ApiResponse> getMyAttempts() {
        List<QuizDto.QuizResultResponse> attempts = quizService.getUserAttempts();
        return ResponseEntity.ok(ApiResponse.success("Attempts retrieved", attempts));
    }
}
