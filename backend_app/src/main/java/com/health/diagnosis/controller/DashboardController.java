package com.health.diagnosis.controller;

import com.health.diagnosis.dto.DashboardStats;
import com.health.diagnosis.entity.Appointment;
import com.health.diagnosis.entity.Diagnosis;
import com.health.diagnosis.entity.User;
import com.health.diagnosis.enums.Role;
import com.health.diagnosis.repository.AppointmentRepository;
import com.health.diagnosis.repository.DiagnosisRepository;
import com.health.diagnosis.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final AppointmentRepository appointmentRepository;
    private final DiagnosisRepository diagnosisRepository;
    private final UserRepository userRepository;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStats> getDashboardStats(@AuthenticationPrincipal User user) {
        DashboardStats stats = new DashboardStats();

        if (user.getRole() == Role.PATIENT) {
            // Patient stats
            List<Appointment> upcoming = appointmentRepository.findUpcomingByPatient(user, LocalDate.now());
            stats.setUpcomingAppointments(upcoming.size());

            // Get last assessment
            List<Diagnosis> diagnoses = diagnosisRepository.findByUser(user);
            if (!diagnoses.isEmpty()) {
                Diagnosis last = diagnoses.get(diagnoses.size() - 1);
                stats.setLastRiskLevel(last.getRiskLevel());
            }

        } else if (user.getRole() == Role.DOCTOR) {
            // Doctor stats
            List<Appointment> today = appointmentRepository.findByDoctorAndDate(user, LocalDate.now());
            stats.setTodayAppointments(today.size());

            List<Appointment> allAppointments = appointmentRepository.findByDoctor(user);
            stats.setDoctorTotalPatients((int) allAppointments.stream()
                    .map(Appointment::getPatient)
                    .distinct()
                    .count());

            stats.setPendingAppointments((int) appointmentRepository
                    .findUpcomingByDoctor(user, LocalDate.now()).size());

        } else if (user.getRole() == Role.ADMIN) {
            // Admin stats
            stats.setTotalUsers(userRepository.count());
            stats.setTotalDoctors((long) userRepository.findByRole(Role.DOCTOR).size());
            stats.setAdminTotalPatients((long) userRepository.findByRole(Role.PATIENT).size());
            stats.setTotalAppointments(appointmentRepository.count());
        }

        return ResponseEntity.ok(stats);
    }
}
