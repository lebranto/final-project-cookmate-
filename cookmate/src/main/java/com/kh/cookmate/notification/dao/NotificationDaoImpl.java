package com.kh.cookmate.notification.dao;

import java.util.List;
import java.util.Map;

import org.mybatis.spring.SqlSessionTemplate;
import org.springframework.stereotype.Repository;

import com.kh.cookmate.notification.dto.NotificationDto;

import lombok.RequiredArgsConstructor;

@Repository
@RequiredArgsConstructor
public class NotificationDaoImpl implements NotificationDao {
    private final SqlSessionTemplate session;

    @Override
    public List<NotificationDto> selectNotifications(long userNo) {
        return session.selectList("notification.selectNotifications", userNo);
    }

    @Override
    public int selectUnreadCount(long userNo) {
        Integer count = session.selectOne("notification.selectUnreadCount", userNo);
        return count == null ? 0 : count;
    }

    @Override
    public int markAsRead(Map<String, Object> params) {
        return session.update("notification.markAsRead", params);
    }

    @Override
    public int markAllAsRead(long userNo) {
        return session.update("notification.markAllAsRead", userNo);
    }

    @Override
    public int insertLikeNotification(Map<String, Object> params) {
        return session.insert("notification.insertLikeNotification", params);
    }

    @Override
    public int insertScrapNotification(Map<String, Object> params) {
        return session.insert("notification.insertScrapNotification", params);
    }

    @Override
    public int insertCommentNotification(Map<String, Object> params) {
        return session.insert("notification.insertCommentNotification", params);
    }

    @Override
    public int insertReplyNotification(Map<String, Object> params) {
        return session.insert("notification.insertReplyNotification", params);
    }

    @Override
    public int insertFollowNotification(Map<String, Object> params) {
        return session.insert("notification.insertFollowNotification", params);
    }

    @Override
    public int insertRecipeNotifications(Map<String, Object> params) {
        return session.insert("notification.insertRecipeNotifications", params);
    }
}
