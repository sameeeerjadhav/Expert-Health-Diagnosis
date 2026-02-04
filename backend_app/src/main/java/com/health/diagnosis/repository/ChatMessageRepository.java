package com.health.diagnosis.repository;

import com.health.diagnosis.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    // Find chat history between two users
    List<ChatMessage> findBySenderIdAndRecipientIdOrSenderIdAndRecipientIdOrderByTimestampAsc(
            Long senderId1, Long recipientId1, Long senderId2, Long recipientId2);

    // Count unread messages from sender to recipient
    Long countBySenderIdAndRecipientIdAndIsReadFalse(Long senderId, Long recipientId);

    // Find unread messages from sender to recipient
    List<ChatMessage> findBySenderIdAndRecipientIdAndIsReadFalse(Long senderId, Long recipientId);

}