package com.health.diagnosis.controller;

import com.health.diagnosis.entity.ChatMessage;
import com.health.diagnosis.repository.ChatMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;

import java.time.LocalDateTime;
import java.util.List;

@Controller
@RequiredArgsConstructor
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatMessageRepository chatMessageRepository;

    // WebSocket Endpoint: /app/chat
    @MessageMapping("/chat")
    public void processMessage(@Payload ChatMessage chatMessage) {
        chatMessage.setTimestamp(LocalDateTime.now());

        // Save to DB
        ChatMessage saved = chatMessageRepository.save(chatMessage);

        // Push to specific recipient topic (e.g., /topic/messages/5)
        messagingTemplate.convertAndSend(
                "/topic/messages/" + chatMessage.getRecipientId(),
                saved);
    }

    // REST Endpoint to fetch history
    @GetMapping("/api/chat/history/{userId1}/{userId2}")
    public ResponseEntity<List<ChatMessage>> getChatHistory(
            @PathVariable Long userId1,
            @PathVariable Long userId2) {
        return ResponseEntity.ok(
                chatMessageRepository.findBySenderIdAndRecipientIdOrSenderIdAndRecipientIdOrderByTimestampAsc(
                        userId1, userId2, userId2, userId1));
    }

    // Get unread message count from a specific user
    @GetMapping("/api/chat/unread-count/{recipientId}/{senderId}")
    public ResponseEntity<Long> getUnreadCount(
            @PathVariable Long recipientId,
            @PathVariable Long senderId) {
        long count = chatMessageRepository.countBySenderIdAndRecipientIdAndIsReadFalse(senderId, recipientId);
        return ResponseEntity.ok(count);
    }

    // Mark all messages from a user as read
    @PostMapping("/api/chat/mark-read/{recipientId}/{senderId}")
    public ResponseEntity<Void> markMessagesAsRead(
            @PathVariable Long recipientId,
            @PathVariable Long senderId) {
        List<ChatMessage> messages = chatMessageRepository
                .findBySenderIdAndRecipientIdAndIsReadFalse(senderId, recipientId);
        messages.forEach(msg -> msg.setIsRead(true));
        chatMessageRepository.saveAll(messages);
        return ResponseEntity.ok().build();
    }
}