package com.health.diagnosis.dto;

import com.health.diagnosis.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {
    private String fullName;
    private String email;
    private String password;
    private Role role;

    // Optional fields for Doctor
    private String specialization;
    private String experience;
}
