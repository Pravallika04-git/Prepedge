package com.placementportal.service;

import com.placementportal.dto.QuizDto;
import com.placementportal.model.*;
import com.placementportal.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuizService {

    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;
    private final QuizAttemptRepository attemptRepository;
    private final AnswerRepository answerRepository;
    private final AuthService authService;

    public List<QuizDto.QuizResponse> getAllActiveQuizzes() {
        return quizRepository.findByIsActiveTrue().stream()
                .map(this::mapToQuizResponse)
                .collect(Collectors.toList());
    }

    public List<QuizDto.QuizResponse> getQuizzesByCategory(String category) {
        return quizRepository.findByCategoryAndIsActiveTrue(category).stream()
                .map(this::mapToQuizResponse)
                .collect(Collectors.toList());
    }

    public QuizDto.QuizResponse getQuizById(Long id) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));
        return mapToQuizResponse(quiz);
    }

    public List<QuizDto.QuestionResponse> getQuizQuestions(Long quizId) {
        return questionRepository.findByQuizId(quizId).stream()
                .map(this::mapToQuestionResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public QuizDto.QuizResponse createQuiz(QuizDto.QuizRequest request) {
        User user = authService.getCurrentUser();

        Quiz quiz = Quiz.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .difficulty(Quiz.Difficulty.valueOf(request.getDifficulty()))
                .durationMinutes(request.getDurationMinutes())
                .isActive(true)
                .createdBy(user)
                .build();

        int totalMarks = 0;
        List<Question> questions = new ArrayList<>();
        if (request.getQuestions() != null) {
            for (QuizDto.QuestionRequest qr : request.getQuestions()) {
                Question question = Question.builder()
                        .quiz(quiz)
                        .questionText(qr.getQuestionText())
                        .questionType(Question.QuestionType.valueOf(qr.getQuestionType()))
                        .optionA(qr.getOptionA())
                        .optionB(qr.getOptionB())
                        .optionC(qr.getOptionC())
                        .optionD(qr.getOptionD())
                        .correctAnswer(qr.getCorrectAnswer())
                        .explanation(qr.getExplanation())
                        .marks(qr.getMarks() != null ? qr.getMarks() : 1)
                        .codeTemplate(qr.getCodeTemplate())
                        .testCases(qr.getTestCases())
                        .build();
                questions.add(question);
                totalMarks += question.getMarks();
            }
        }
        quiz.setTotalMarks(totalMarks);
        quiz.setQuestions(questions);
        quiz = quizRepository.save(quiz);
        return mapToQuizResponse(quiz);
    }

    @Transactional
    public QuizDto.QuizResultResponse submitQuiz(QuizDto.SubmitQuizRequest request) {
        User user = authService.getCurrentUser();
        Quiz quiz = quizRepository.findById(request.getQuizId())
                .orElseThrow(() -> new RuntimeException("Quiz not found"));

        QuizAttempt attempt = QuizAttempt.builder()
                .user(user)
                .quiz(quiz)
                .timeTakenSeconds(request.getTimeTakenSeconds())
                .build();
        attempt = attemptRepository.save(attempt);

        int totalScore = 0;
        int totalMarks = 0;
        List<QuizDto.AnswerResultResponse> answerResults = new ArrayList<>();

        for (QuizDto.SubmitAnswerRequest ansReq : request.getAnswers()) {
            Question question = questionRepository.findById(ansReq.getQuestionId())
                    .orElseThrow(() -> new RuntimeException("Question not found"));

            boolean isCorrect = question.getCorrectAnswer()
                    .equalsIgnoreCase(ansReq.getSelectedAnswer());
            int marksAwarded = isCorrect ? question.getMarks() : 0;

            Answer answer = Answer.builder()
                    .attempt(attempt)
                    .question(question)
                    .selectedAnswer(ansReq.getSelectedAnswer())
                    .isCorrect(isCorrect)
                    .marksAwarded(marksAwarded)
                    .build();
            answerRepository.save(answer);

            totalScore += marksAwarded;
            totalMarks += question.getMarks();

            answerResults.add(QuizDto.AnswerResultResponse.builder()
                    .questionId(question.getId())
                    .questionText(question.getQuestionText())
                    .selectedAnswer(ansReq.getSelectedAnswer())
                    .correctAnswer(question.getCorrectAnswer())
                    .isCorrect(isCorrect)
                    .marksAwarded(marksAwarded)
                    .explanation(question.getExplanation())
                    .build());
        }

        double percentage = totalMarks > 0 ? (totalScore * 100.0 / totalMarks) : 0;
        attempt.setScore(totalScore);
        attempt.setTotalMarks(totalMarks);
        attempt.setPercentage(percentage);
        attempt.setStatus(QuizAttempt.AttemptStatus.COMPLETED);
        attempt.setCompletedAt(LocalDateTime.now());
        attemptRepository.save(attempt);

        return QuizDto.QuizResultResponse.builder()
                .attemptId(attempt.getId())
                .quizTitle(quiz.getTitle())
                .score(totalScore)
                .totalMarks(totalMarks)
                .percentage(percentage)
                .timeTakenSeconds(request.getTimeTakenSeconds())
                .answers(answerResults)
                .build();
    }

    public List<QuizDto.QuizResultResponse> getUserAttempts() {
        User user = authService.getCurrentUser();
        return attemptRepository.findByUserIdOrderByStartedAtDesc(user.getId()).stream()
                .map(attempt -> QuizDto.QuizResultResponse.builder()
                        .attemptId(attempt.getId())
                        .quizTitle(attempt.getQuiz().getTitle())
                        .score(attempt.getScore())
                        .totalMarks(attempt.getTotalMarks())
                        .percentage(attempt.getPercentage())
                        .timeTakenSeconds(attempt.getTimeTakenSeconds())
                        .build())
                .collect(Collectors.toList());
    }

    private QuizDto.QuizResponse mapToQuizResponse(Quiz quiz) {
        return QuizDto.QuizResponse.builder()
                .id(quiz.getId())
                .title(quiz.getTitle())
                .description(quiz.getDescription())
                .category(quiz.getCategory())
                .difficulty(quiz.getDifficulty().name())
                .durationMinutes(quiz.getDurationMinutes())
                .totalMarks(quiz.getTotalMarks())
                .questionCount(quiz.getQuestions() != null ? quiz.getQuestions().size() : 0)
                .isActive(quiz.getIsActive())
                .createdBy(quiz.getCreatedBy() != null ? quiz.getCreatedBy().getFullName() : "System")
                .build();
    }

    private QuizDto.QuestionResponse mapToQuestionResponse(Question q) {
        return QuizDto.QuestionResponse.builder()
                .id(q.getId())
                .questionText(q.getQuestionText())
                .questionType(q.getQuestionType().name())
                .optionA(q.getOptionA())
                .optionB(q.getOptionB())
                .optionC(q.getOptionC())
                .optionD(q.getOptionD())
                .marks(q.getMarks())
                .codeTemplate(q.getCodeTemplate())
                .build();
    }
}
