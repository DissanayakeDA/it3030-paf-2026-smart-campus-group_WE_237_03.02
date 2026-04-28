package com.smartcampus.notification.dto;

import com.smartcampus.notification.enums.NotificationType;
import lombok.*;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationResponse {
    private Long id;
    private Long recipientUserId;
    private NotificationType type;
    private String message;
    private Long referenceId;
    private boolean read;
    private Instant createdAt;
}
