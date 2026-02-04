package com.health.diagnosis.service;

import com.health.diagnosis.entity.DoctorProfile;
import com.health.diagnosis.repository.DoctorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final com.health.diagnosis.repository.AppointmentRepository appointmentRepository;

    public List<DoctorProfile> getAllDoctors() {
        return doctorRepository.findAll();
    }

    public List<DoctorProfile> recommendDoctors(String riskLevel) {
        // Simple logic:
        // High Risk -> Psychiatrist
        // Medium/Low Risk -> Therapist

        String targetSpecialization = "Therapist";
        if ("High".equalsIgnoreCase(riskLevel)) {
            targetSpecialization = "Psychiatrist";
        }

        return doctorRepository.findBySpecialization(targetSpecialization);
    }

    public List<com.health.diagnosis.entity.User> getMyPatients(com.health.diagnosis.entity.User doctor) {
        return appointmentRepository.findByDoctor(doctor).stream()
                .map(com.health.diagnosis.entity.Appointment::getPatient)
                .distinct()
                .collect(java.util.stream.Collectors.toList());
    }
}
