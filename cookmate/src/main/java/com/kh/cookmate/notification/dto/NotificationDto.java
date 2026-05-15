package com.kh.cookmate.notification.dto;

import lombok.Data;

@Data
public class NotificationDto {
    private long notificationNo;
    private long userNo;
    private long actorUserNo;
    private String actorNickname;
    private String actorProfileImageUrl;
    private String notificationType;
    private String message;
    private Long boardNo;
    private Long commentNo;
    private String readYn;
    private String createdAt;
}
