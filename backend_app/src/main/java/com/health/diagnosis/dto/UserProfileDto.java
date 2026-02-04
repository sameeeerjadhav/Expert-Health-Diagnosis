package com.health.diagnosis.dto;

import com.health.diagnosis.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileDto {
    private Long id;
    private String fullName;
    private String email;
    private Role role;
    private String phone;
    private String address;

    // Patient Fields
    private Integer age;
    private String gender;
    private String bloodGroup;
    private String medicalHistory;

    // Doctor Fields
    private String specialization;
    private String experience;
    private boolean isVerified;
    private String qualifications;
    private String bio;
    private String clinicAddress;
    private Double consultationFee;
    private String languagesSpoken;
    private String availableHours;
}
