package com.health.diagnosis.controller;

import com.health.diagnosis.dto.UserProfileDto;
import com.health.diagnosis.entity.DoctorProfile;
import com.health.diagnosis.entity.User;
import com.health.diagnosis.enums.Role;
import com.health.diagnosis.repository.DoctorRepository;
import com.health.diagnosis.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;

    @GetMapping("/patients")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<List<User>> getAllPatients() {
        return ResponseEntity.ok(userRepository.findByRole(Role.PATIENT));
    }

    @GetMapping("/doctors")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<List<User>> getAllDoctors() {
        return ResponseEntity.ok(userRepository.findByRole(Role.DOCTOR));
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileDto> getCurrentUser(@AuthenticationPrincipal User user) {
        UserProfileDto dto = UserProfileDto.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .phone(user.getPhone())
                .address(user.getAddress())
                // Patient fields
                .age(user.getAge())
                .gender(user.getGender())
                .bloodGroup(user.getBloodGroup())
                .medicalHistory(user.getMedicalHistory())
                // Basic Doctor fields from User entity
                .specialization(user.getSpecialization())
                .experience(user.getExperience())
                .isVerified(user.isVerified())
                .build();

        if (user.getRole() == Role.DOCTOR) {
            Optional<DoctorProfile> doctorProfileOpt = doctorRepository.findByUser(user);
            if (doctorProfileOpt.isPresent()) {
                DoctorProfile doc = doctorProfileOpt.get();
                dto.setQualifications(doc.getQualifications());
                dto.setBio(doc.getBio());
                dto.setClinicAddress(doc.getClinicAddress());
                dto.setConsultationFee(doc.getConsultationFee());
                dto.setLanguagesSpoken(doc.getLanguagesSpoken());
                dto.setAvailableHours(doc.getAvailableHours());
            }
        }

        return ResponseEntity.ok(dto);
    }

    @PutMapping("/me")
    public ResponseEntity<UserProfileDto> updateProfile(@AuthenticationPrincipal User currentUser,
            @RequestBody UserProfileDto updatedData) {

        // Update User Entity Fields
        currentUser.setFullName(updatedData.getFullName());
        currentUser.setPhone(updatedData.getPhone());
        currentUser.setAddress(updatedData.getAddress());

        if (currentUser.getRole() == Role.PATIENT) {
            currentUser.setAge(updatedData.getAge());
            currentUser.setGender(updatedData.getGender());
            currentUser.setBloodGroup(updatedData.getBloodGroup());
            currentUser.setMedicalHistory(updatedData.getMedicalHistory());
        } else if (currentUser.getRole() == Role.DOCTOR) {
            currentUser.setSpecialization(updatedData.getSpecialization());
            currentUser.setExperience(updatedData.getExperience()); // e.g. "12 Years"

            // Update DoctorProfile Entity
            DoctorProfile doctorProfile = doctorRepository.findByUser(currentUser)
                    .orElse(DoctorProfile.builder().user(currentUser).build());

            doctorProfile.setQualifications(updatedData.getQualifications());
            doctorProfile.setBio(updatedData.getBio());
            doctorProfile.setClinicAddress(updatedData.getClinicAddress());
            doctorProfile.setConsultationFee(updatedData.getConsultationFee());
            doctorProfile.setLanguagesSpoken(updatedData.getLanguagesSpoken());
            doctorProfile.setAvailableHours(updatedData.getAvailableHours());

            doctorRepository.save(doctorProfile);
        }

        userRepository.save(currentUser);

        // Return updated DTO (reuse get logic or simple mapping)
        return getCurrentUser(currentUser);
    }
}
