package com.smartcampus.notification.service;

import com.smartcampus.notification.dto.NotificationResponse;
import com.smartcampus.notification.enums.NotificationType;

import java.util.List;

public interface NotificationService {
    void create(Long recipientUserId, NotificationType type, String message, Long referenceId);
    List<NotificationResponse> getForUser(Long userId);
    void markRead(Long notificationId);
    void markAllRead(Long userId);
    long getUnreadCount(Long userId);
}
