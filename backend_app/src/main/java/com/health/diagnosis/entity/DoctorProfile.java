package com.health.diagnosis.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "doctor_profiles")
public class DoctorProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(columnDefinition = "TEXT")
    private String bio;

    private String clinicAddress;

    private Double rating; // 0.0 to 5.0

    private String availableHours; // e.g. "9AM - 5PM"

    // New fields for enhanced profile
    @Column(columnDefinition = "TEXT")
    private String qualifications;

    private Integer yearsOfExperience;
    private Double consultationFee;
    private String languagesSpoken; // Comma-separated
}
