package com.health.diagnosis.controller;

import com.health.diagnosis.entity.DoctorProfile;
import com.health.diagnosis.service.DoctorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import com.health.diagnosis.entity.User;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorService doctorService;

    @GetMapping
    public ResponseEntity<List<DoctorProfile>> getAllDoctors() {
        return ResponseEntity.ok(doctorService.getAllDoctors());
    }

    @GetMapping("/recommend")
    public ResponseEntity<List<DoctorProfile>> recommendDoctors(
            @RequestParam String riskLevel) {
        return ResponseEntity.ok(doctorService.recommendDoctors(riskLevel));
    }

    @GetMapping("/my-patients")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<List<User>> getMyPatients(@AuthenticationPrincipal User doctor) {
        return ResponseEntity.ok(doctorService.getMyPatients(doctor));
    }
}
