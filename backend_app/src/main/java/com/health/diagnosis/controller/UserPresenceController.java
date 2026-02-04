package com.health.diagnosis.controller;

import com.health.diagnosis.entity.User;
import com.health.diagnosis.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserPresenceController {

    private final UserRepository userRepository;

    @PostMapping("/heartbeat")
    public ResponseEntity<Void> updateHeartbeat(@AuthenticationPrincipal User user) {
        user.setLastSeen(LocalDateTime.now());
        userRepository.save(user);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{userId}/status")
    public ResponseEntity<Map<String, Object>> getUserStatus(@PathVariable Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean isOnline = false;
        if (user.getLastSeen() != null) {
            long minutesSinceLastSeen = ChronoUnit.MINUTES.between(user.getLastSeen(), LocalDateTime.now());
            isOnline = minutesSinceLastSeen < 2; // Online if active within last 2 minutes
        }

        return ResponseEntity.ok(Map.of(
                "isOnline", isOnline,
                "lastSeen", user.getLastSeen() != null ? user.getLastSeen().toString() : "Never"));
    }
}
