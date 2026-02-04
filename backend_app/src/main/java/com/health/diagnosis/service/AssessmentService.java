package com.health.diagnosis.service;

import com.health.diagnosis.dto.AssessmentSubmission;
import com.health.diagnosis.entity.Diagnosis;
import com.health.diagnosis.entity.User;
import com.health.diagnosis.repository.DiagnosisRepository;
import com.health.diagnosis.repository.QuestionRepository;
import com.health.diagnosis.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class AssessmentService {

    private final DiagnosisRepository diagnosisRepository;
    private final QuestionRepository questionRepository;
    private final UserRepository userRepository;

    public Diagnosis submitAssessment(AssessmentSubmission submission) {
        // Validate: Check if all questions are answered
        long totalQuestions = questionRepository.count();
        int answeredQuestions = submission.getAnswers().size();

        if (answeredQuestions < totalQuestions) {
            throw new IllegalArgumentException(
                    String.format("Incomplete assessment: %d/%d questions answered. Please answer all questions.",
                            answeredQuestions, totalQuestions));
        }

        // 1. Calculate Score
        int totalScore = submission.getAnswers().values().stream()
                .mapToInt(Integer::intValue)
                .sum();

        // 2. Determine Risk
        String riskLevel;
        if (totalScore <= 5) {
            riskLevel = "Low";
        } else if (totalScore <= 15) {
            riskLevel = "Medium";
        } else {
            riskLevel = "High";
        }

        // 3. Get Current User
        String email = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal())
                .getUsername();
        User user = userRepository.findByEmail(email).orElseThrow();

        // 4. Save Diagnosis
        Diagnosis diagnosis = Diagnosis.builder()
                .user(user)
                .totalScore(totalScore)
                .riskLevel(riskLevel)
                .build();

        return diagnosisRepository.save(diagnosis);
    }

    public java.util.List<Diagnosis> getHistory(User user) {
        return diagnosisRepository.findByUser(user);
    }
}
