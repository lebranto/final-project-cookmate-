package com.kh.cookmate.notification.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.kh.cookmate.notification.dao.NotificationDao;
import com.kh.cookmate.notification.dto.NotificationDto;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {
    private final NotificationDao notificationDao;

    @Override
    public List<NotificationDto> getNotifications(long userNo) {
        return notificationDao.selectNotifications(userNo);
    }

    @Override
    public int getUnreadCount(long userNo) {
        return notificationDao.selectUnreadCount(userNo);
    }

    @Override
    public int markAsRead(long userNo, long notificationNo) {
        Map<String, Object> params = new HashMap<>();
        params.put("userNo", userNo);
        params.put("notificationNo", notificationNo);
        return notificationDao.markAsRead(params);
    }

    @Override
    public int markAllAsRead(long userNo) {
        return notificationDao.markAllAsRead(userNo);
    }

    @Override
    @Transactional
    public void notifyLike(int boardNo, int actorUserNo) {
        notificationDao.insertLikeNotification(baseParams(boardNo, actorUserNo, null));
    }

    @Override
    @Transactional
    public void notifyScrap(int boardNo, int actorUserNo) {
        notificationDao.insertScrapNotification(baseParams(boardNo, actorUserNo, null));
    }

    @Override
    @Transactional
    public void notifyComment(int boardNo, int commentNo, int actorUserNo) {
        notificationDao.insertCommentNotification(baseParams(boardNo, actorUserNo, commentNo));
    }

    @Override
    @Transactional
    public void notifyReply(int boardNo, int parentCommentNo, int commentNo, int actorUserNo) {
        Map<String, Object> params = baseParams(boardNo, actorUserNo, commentNo);
        params.put("parentCommentNo", parentCommentNo);
        notificationDao.insertReplyNotification(params);
    }

    @Override
    @Transactional
    public void notifyFollow(long actorUserNo, String targetEmail) {
        Map<String, Object> params = new HashMap<>();
        params.put("actorUserNo", actorUserNo);
        params.put("targetEmail", targetEmail);
        notificationDao.insertFollowNotification(params);
    }

    @Override
    @Transactional
    public void notifyRecipeCreated(int boardNo, int actorUserNo) {
        notificationDao.insertRecipeNotifications(baseParams(boardNo, actorUserNo, null));
    }

    private Map<String, Object> baseParams(int boardNo, int actorUserNo, Integer commentNo) {
        Map<String, Object> params = new HashMap<>();
        params.put("boardNo", boardNo);
        params.put("actorUserNo", actorUserNo);
        params.put("commentNo", commentNo);
        return params;
    }
}
