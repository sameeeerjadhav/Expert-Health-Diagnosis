package com.health.diagnosis.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SignalMessage {
    private String type; // "Login", "Offer", "Answer", "Candidate", "Leave"
    private Long senderId;
    private Long recipientId;
    private Object data; // SDP or ICE Candidate payload
}
