package com.kh.cookmate.notification.dao;

import java.util.List;
import java.util.Map;

import com.kh.cookmate.notification.dto.NotificationDto;

public interface NotificationDao {
    List<NotificationDto> selectNotifications(long userNo);
    int selectUnreadCount(long userNo);
    int markAsRead(Map<String, Object> params);
    int markAllAsRead(long userNo);
    int insertLikeNotification(Map<String, Object> params);
    int insertScrapNotification(Map<String, Object> params);
    int insertCommentNotification(Map<String, Object> params);
    int insertReplyNotification(Map<String, Object> params);
    int insertFollowNotification(Map<String, Object> params);
    int insertRecipeNotifications(Map<String, Object> params);
}
