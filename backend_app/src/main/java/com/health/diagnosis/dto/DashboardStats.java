package com.health.diagnosis.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DashboardStats {
    // Patient stats
    private Integer upcomingAppointments;
    private String lastAssessmentDate;
    private String lastRiskLevel;
    private String assignedDoctorName;

    // Doctor stats
    private Integer todayAppointments;
    private Integer doctorTotalPatients;
    private Integer pendingAppointments;
    private Long totalAssessments;

    // Admin stats
    private Long totalUsers;
    private Long totalDoctors;
    private Long adminTotalPatients;
    private Long totalAppointments;
}
