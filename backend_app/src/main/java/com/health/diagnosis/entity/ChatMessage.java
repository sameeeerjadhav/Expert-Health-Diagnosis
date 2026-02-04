package com.health.diagnosis.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "chat_messages")
public class ChatMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long senderId; // User ID of sender
    private Long recipientId; // User ID of recipient (Doctor/Patient)

    private String senderName; // For UI convenience

    @Column(columnDefinition = "TEXT")
    private String content;

    private LocalDateTime timestamp;

    // Read status tracking
    @Builder.Default
    private Boolean isRead = false;

    // File attachment support
    private String attachmentUrl;
    private String attachmentType; // IMAGE, DOCUMENT, null

    @PrePersist
    protected void onCreate() {
        timestamp = LocalDateTime.now();
    }
}
