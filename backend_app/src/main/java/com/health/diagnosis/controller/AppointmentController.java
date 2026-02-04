package com.health.diagnosis.controller;

import com.health.diagnosis.dto.AppointmentRequest;
import com.health.diagnosis.entity.Appointment;
import com.health.diagnosis.entity.User;
import com.health.diagnosis.enums.AppointmentStatus;
import com.health.diagnosis.repository.AppointmentRepository;
import com.health.diagnosis.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final com.health.diagnosis.service.NotificationService notificationService;

    @PostMapping("/book")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<Appointment> bookAppointment(
            @RequestBody AppointmentRequest request,
            @AuthenticationPrincipal User patient) {

        User doctor = userRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        Appointment appointment = Appointment.builder()
                .patient(patient)
                .doctor(doctor)
                .appointmentDate(request.getAppointmentDate())
                .timeSlot(request.getTimeSlot())
                .notes(request.getNotes())
                .status(AppointmentStatus.PENDING)
                .build();

        appointment = appointmentRepository.save(appointment);

        // Send notification to doctor
        notificationService.createNotification(
                doctor,
                com.health.diagnosis.entity.Notification.NotificationType.APPOINTMENT,
                "New Appointment Request",
                "New appointment from " + patient.getFullName() + " on " + request.getAppointmentDate(),
                appointment.getId());

        return ResponseEntity.ok(appointment);
    }

    @GetMapping("/my-appointments")
    public ResponseEntity<List<Appointment>> getMyAppointments(@AuthenticationPrincipal User user) {
        List<Appointment> appointments;

        if (user.getRole().name().equals("DOCTOR")) {
            appointments = appointmentRepository.findByDoctor(user);
        } else {
            appointments = appointmentRepository.findByPatient(user);
        }

        return ResponseEntity.ok(appointments);
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<Appointment>> getUpcomingAppointments(@AuthenticationPrincipal User user) {
        List<Appointment> appointments;
        LocalDate today = LocalDate.now();

        if (user.getRole().name().equals("DOCTOR")) {
            appointments = appointmentRepository.findUpcomingByDoctor(user, today);
        } else {
            appointments = appointmentRepository.findUpcomingByPatient(user, today);
        }

        return ResponseEntity.ok(appointments);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Appointment> updateStatus(
            @PathVariable Long id,
            @RequestParam AppointmentStatus status,
            @AuthenticationPrincipal User user) {

        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        // Verify user is either the patient or doctor
        if (!appointment.getPatient().getId().equals(user.getId()) &&
                !appointment.getDoctor().getId().equals(user.getId())) {
            return ResponseEntity.status(403).build();
        }

        appointment.setStatus(status);
        return ResponseEntity.ok(appointmentRepository.save(appointment));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelAppointment(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {

        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        // Verify user is either the patient or doctor
        if (!appointment.getPatient().getId().equals(user.getId()) &&
                !appointment.getDoctor().getId().equals(user.getId())) {
            return ResponseEntity.status(403).build();
        }

        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointmentRepository.save(appointment);

        return ResponseEntity.ok().build();
    }

    @GetMapping("/booked-slots")
    public ResponseEntity<List<String>> getBookedSlots(
            @RequestParam Long doctorId,
            @RequestParam String date) {

        User doctor = userRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        LocalDate localDate = LocalDate.parse(date);

        List<String> bookedSlots = appointmentRepository.findByDoctorAndDate(doctor, localDate)
                .stream()
                .filter(a -> a.getStatus() != AppointmentStatus.CANCELLED)
                .map(Appointment::getTimeSlot)
                .collect(java.util.stream.Collectors.toList());

        return ResponseEntity.ok(bookedSlots);
    }

    // Get past appointments
    @GetMapping("/past")
    public ResponseEntity<List<Appointment>> getPastAppointments(@AuthenticationPrincipal User user) {
        List<Appointment> appointments;
        LocalDate today = LocalDate.now();

        if (user.getRole().name().equals("DOCTOR")) {
            appointments = appointmentRepository.findPastByDoctor(user, today);
        } else {
            appointments = appointmentRepository.findPastByPatient(user, today);
        }

        return ResponseEntity.ok(appointments);
    }

    // Get cancelled appointments
    @GetMapping("/cancelled")
    public ResponseEntity<List<Appointment>> getCancelledAppointments(@AuthenticationPrincipal User user) {
        List<Appointment> appointments;

        if (user.getRole().name().equals("DOCTOR")) {
            appointments = appointmentRepository.findCancelledByDoctor(user);
        } else {
            appointments = appointmentRepository.findCancelledByPatient(user);
        }

        return ResponseEntity.ok(appointments);
    }
}
