package com.health.diagnosis.controller;

import com.health.diagnosis.dto.AssessmentSubmission;
import com.health.diagnosis.entity.Diagnosis;
import com.health.diagnosis.entity.Question;
import com.health.diagnosis.repository.QuestionRepository;
import com.health.diagnosis.service.AssessmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assessment")
@RequiredArgsConstructor
public class AssessmentController {

    private final QuestionRepository questionRepository;
    private final AssessmentService assessmentService;

    @GetMapping("/questions")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<List<Question>> getAllQuestions() {
        return ResponseEntity.ok(questionRepository.findAll());
    }

    @PostMapping("/submit")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<Diagnosis> submitAssessment(@RequestBody AssessmentSubmission submission) {
        return ResponseEntity.ok(assessmentService.submitAssessment(submission));
    }

    @GetMapping("/history")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<List<Diagnosis>> getHistory(
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.health.diagnosis.entity.User user) {
        return ResponseEntity.ok(assessmentService.getHistory(user));
    }
}
