package com.health.diagnosis.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AssessmentSubmission {
    // Map of QuestionID -> Score (0-3 usually)
    // 0: Not at all, 1: Several days, 2: More than half, 3: Nearly every day
    private Map<Long, Integer> answers;
}
