package com.health.diagnosis.service;

import com.health.diagnosis.config.JwtService;
import com.health.diagnosis.dto.AuthenticationRequest;
import com.health.diagnosis.dto.AuthenticationResponse;
import com.health.diagnosis.dto.RegisterRequest;
import com.health.diagnosis.entity.User;
import com.health.diagnosis.enums.Role;
import com.health.diagnosis.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthenticationService {
        private final UserRepository repository;
        private final PasswordEncoder passwordEncoder;
        private final JwtService jwtService;
        private final AuthenticationManager authenticationManager;

        public AuthenticationResponse register(RegisterRequest request) {
                var role = request.getRole() != null ? request.getRole() : Role.PATIENT; // Default to PATIENT

                var user = User.builder()
                                .fullName(request.getFullName())
                                .email(request.getEmail())
                                .password(passwordEncoder.encode(request.getPassword()))
                                .role(role)
                                .specialization(request.getSpecialization())
                                .experience(request.getExperience())
                                .isVerified(role != Role.DOCTOR) // Doctors need verification, Patients don't
                                .isEnabled(true)
                                .build();

                repository.save(user);

                java.util.Map<String, Object> extraClaims = new java.util.HashMap<>();
                extraClaims.put("role", user.getRole().name());

                var jwtToken = jwtService.generateToken(extraClaims, user);
                return AuthenticationResponse.builder()
                                .token(jwtToken)
                                .build();
        }

        public AuthenticationResponse authenticate(AuthenticationRequest request) {
                authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(
                                                request.getEmail(),
                                                request.getPassword()));
                var user = repository.findByEmail(request.getEmail())
                                .orElseThrow();

                java.util.Map<String, Object> extraClaims = new java.util.HashMap<>();
                extraClaims.put("role", user.getRole().name());

                var jwtToken = jwtService.generateToken(extraClaims, user);
                return AuthenticationResponse.builder()
                                .token(jwtToken)
                                .build();
        }
}
