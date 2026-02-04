package com.health.diagnosis.controller;

import com.health.diagnosis.entity.Appointment;
import com.health.diagnosis.entity.Question;
import com.health.diagnosis.entity.User;
import com.health.diagnosis.enums.Role;
import com.health.diagnosis.repository.AppointmentRepository;
import com.health.diagnosis.repository.QuestionRepository;
import com.health.diagnosis.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final AppointmentRepository appointmentRepository;
    private final QuestionRepository questionRepository;
    private final PasswordEncoder passwordEncoder;

    // USER MANAGEMENT
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @GetMapping("/users/patients")
    public ResponseEntity<List<User>> getAllPatients() {
        return ResponseEntity.ok(userRepository.findByRole(Role.PATIENT));
    }

    @GetMapping("/users/doctors")
    public ResponseEntity<List<User>> getAllDoctors() {
        return ResponseEntity.ok(userRepository.findByRole(Role.DOCTOR));
    }

    @PostMapping("/users")
    public ResponseEntity<User> createUser(@RequestBody com.health.diagnosis.dto.RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .specialization(request.getSpecialization())
                .experience(request.getExperience())
                .build();

        return ResponseEntity.ok(userRepository.save(user));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        if (userRepository.existsById(id)) {
            userRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<com.health.diagnosis.dto.UserProfileDto> getUser(@PathVariable Long id) {
        return userRepository.findById(id).map(user -> {
            com.health.diagnosis.dto.UserProfileDto dto = com.health.diagnosis.dto.UserProfileDto.builder()
                    .id(user.getId())
                    .fullName(user.getFullName())
                    .email(user.getEmail())
                    .role(user.getRole())
                    .phone(user.getPhone())
                    .address(user.getAddress())
                    .age(user.getAge())
                    .gender(user.getGender())
                    .bloodGroup(user.getBloodGroup())
                    .medicalHistory(user.getMedicalHistory())
                    .specialization(user.getSpecialization())
                    .experience(user.getExperience())
                    .isVerified(user.isVerified())
                    .build();
            return ResponseEntity.ok(dto);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id,
            @RequestBody com.health.diagnosis.dto.UserProfileDto updatedData) {
        return userRepository.findById(id).map(user -> {
            user.setFullName(updatedData.getFullName());
            user.setPhone(updatedData.getPhone());
            user.setAddress(updatedData.getAddress());

            if (user.getRole() == Role.PATIENT) {
                user.setAge(updatedData.getAge());
                user.setGender(updatedData.getGender());
                user.setBloodGroup(updatedData.getBloodGroup());
                user.setMedicalHistory(updatedData.getMedicalHistory());
            } else if (user.getRole() == Role.DOCTOR) {
                user.setSpecialization(updatedData.getSpecialization());
                user.setExperience(updatedData.getExperience());
                user.setVerified(updatedData.isVerified()); // Admin can verify doctors
            }
            return ResponseEntity.ok(userRepository.save(user));
        }).orElse(ResponseEntity.notFound().build());
    }

    // APPOINTMENT MANAGEMENT
    @GetMapping("/appointments")
    public ResponseEntity<List<Appointment>> getAllAppointments() {
        return ResponseEntity.ok(appointmentRepository.findAll());
    }

    @PutMapping("/appointments/{id}")
    public ResponseEntity<Appointment> updateAppointment(@PathVariable Long id, @RequestBody Appointment updated) {
        return appointmentRepository.findById(id).map(apt -> {
            apt.setAppointmentDate(updated.getAppointmentDate());
            apt.setTimeSlot(updated.getTimeSlot());
            apt.setStatus(updated.getStatus());
            apt.setNotes(updated.getNotes());
            return ResponseEntity.ok(appointmentRepository.save(apt));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/appointments/{id}")
    public ResponseEntity<Void> deleteAppointment(@PathVariable Long id) {
        if (appointmentRepository.existsById(id)) {
            appointmentRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/appointments")
    public ResponseEntity<Appointment> createAppointment(
            @RequestBody com.health.diagnosis.dto.AppointmentRequest request) {
        User patient = userRepository.findById(request.getPatientId())
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        User doctor = userRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        Appointment appointment = Appointment.builder()
                .patient(patient)
                .doctor(doctor)
                .appointmentDate(request.getAppointmentDate())
                .timeSlot(request.getTimeSlot())
                .notes(request.getNotes())
                .status(com.health.diagnosis.enums.AppointmentStatus.CONFIRMED) // Admins usually confirm directly
                .build();

        return ResponseEntity.ok(appointmentRepository.save(appointment));
    }

    // QUESTION MANAGEMENT
    @GetMapping("/questions")
    public ResponseEntity<List<Question>> getAllQuestions() {
        return ResponseEntity.ok(questionRepository.findAll());
    }

    @PostMapping("/questions")
    public ResponseEntity<Question> createQuestion(@RequestBody Question question) {
        return ResponseEntity.ok(questionRepository.save(question));
    }

    @PutMapping("/questions/{id}")
    public ResponseEntity<Question> updateQuestion(@PathVariable Long id, @RequestBody Question updated) {
        return questionRepository.findById(id)
                .map(question -> {
                    question.setText(updated.getText());
                    question.setCategory(updated.getCategory());
                    return ResponseEntity.ok(questionRepository.save(question));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/questions/{id}")
    public ResponseEntity<Void> deleteQuestion(@PathVariable Long id) {
        if (questionRepository.existsById(id)) {
            questionRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
