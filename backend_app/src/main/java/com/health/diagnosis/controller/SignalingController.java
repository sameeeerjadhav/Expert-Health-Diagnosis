package com.health.diagnosis.controller;

import com.health.diagnosis.dto.SignalMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class SignalingController {

    private final SimpMessagingTemplate messagingTemplate;

    // Client sends to: /app/video/signal
    @MessageMapping("/video/signal")
    public void handleSignal(@Payload SignalMessage message) {
        // Simple relay: Forward the message to the intended recipient
        // Recipient subscribes to: /topic/video/{myUserId}

        System.out.println(
                "Signal: " + message.getType() + " from " + message.getSenderId() + " to " + message.getRecipientId());

        messagingTemplate.convertAndSend(
                "/topic/video/" + message.getRecipientId(),
                message);
    }
}
