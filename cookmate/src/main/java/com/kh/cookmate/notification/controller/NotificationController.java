package com.kh.cookmate.notification.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.kh.cookmate.notification.service.NotificationService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/notifications")
public class NotificationController {
    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<?> getNotifications(@RequestParam long userNo) {
        return ResponseEntity.ok(Map.of(
                "notifications", notificationService.getNotifications(userNo),
                "unreadCount", notificationService.getUnreadCount(userNo)
        ));
    }

    @PatchMapping("/{notificationNo}/read")
    public ResponseEntity<?> markAsRead(
            @PathVariable long notificationNo,
            @RequestParam long userNo) {
        notificationService.markAsRead(userNo, notificationNo);
        return ResponseEntity.ok(Map.of("unreadCount", notificationService.getUnreadCount(userNo)));
    }

    @PatchMapping("/read-all")
    public ResponseEntity<?> markAllAsRead(@RequestParam long userNo) {
        notificationService.markAllAsRead(userNo);
        return ResponseEntity.ok(Map.of("unreadCount", 0));
    }
}
