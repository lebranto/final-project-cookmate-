package com.kh.cookmate.notification.service;

import java.util.List;

import com.kh.cookmate.notification.dto.NotificationDto;

public interface NotificationService {
    List<NotificationDto> getNotifications(long userNo);
    int getUnreadCount(long userNo);
    int markAsRead(long userNo, long notificationNo);
    int markAllAsRead(long userNo);
    void notifyLike(int boardNo, int actorUserNo);
    void notifyScrap(int boardNo, int actorUserNo);
    void notifyComment(int boardNo, int commentNo, int actorUserNo);
    void notifyReply(int boardNo, int parentCommentNo, int commentNo, int actorUserNo);
    void notifyFollow(long actorUserNo, String targetEmail);
    void notifyRecipeCreated(int boardNo, int actorUserNo);
}
