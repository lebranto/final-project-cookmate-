package com.kh.cookmate.admin.dto;

import java.util.Date;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
public class AdminDto {

    // 숫자 카드 영역
    private int totalUsers;
    private int totalRecipes;
    private int pendingReports;
    private int unansweredInquiries;
    
    // 하단 상세 통계 (오늘의 수치)
    private int todayVisitors;
    private int todayLikes;
    private int todayComments;
    private int monthlyBannedUsers;

    // 리스트 영역
    private List<ReportDto> recentReports;
    private List<RecipeDto> topRecipes;
    private List<InquiryDto> unansweredInquiryList;

    // 공지
    private String notice;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReportDto {

        private Long reportId;
        private String reportType;     // 신고 유형
        private String targetId;       // 신고 대상 (유저 or 게시글)
        private String reporterId;  // 신고자 ID 추가
        private String reason;
        private String status;         // PENDING / RESOLVED
        private String createdAt;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecipeDto {

        private Long recipeId;
        private String title;
        private String author;
        private int likeCount;
        private int viewCount;
        private String category;    // 레시피 카테고리 추가
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InquiryDto {

        private Long inquiryId;
        private String userId;
        private String title;
        private String status;     // ANSWERED / UNANSWERED
        private String createdAt;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserPageDto { // 내부 클래스일 경우 static 권장
        private Long userId;        // 번호 (#1, #2...)
        private String nickname;    // 닉네임 (화면에 '닉네임'으로 표시됨)
        private String email;       // 이메일
        private String role;        // 등급 (관리자, 일반)
        private int recipeCount;    // 레시피 수 (이미지에 포함된 필드 - **추가됨**)
        private Date enrollDate;    // 가입일
        private String status;      // 상태 (정상, 정지, 경고)
    }
    
    @Data
    public static class UserSearchDto {
        private String keyword;    // 이름, 이메일, 닉네임 검색어
        private String status;     // 전체 상태 (정상, 정지, 경고 등)
        private String role;       // 전체 등급 (관리자, 일반 등)
        private String orderBy;    // 가입일 최신순, 레시피 많은 순 등
        private int page = 1;      // 현재 페이지 번호
        private int size = 10;     // 한 페이지당 보여줄 게시글 수
    }
    
    @Data
    public static class UserListResponse {
        private List<UserPageDto> userList; // 회원 목록
        private long totalElements;         // 총 회원 수 (18,432)
        private int totalPages;            // 총 페이지 수 (1844)
        private int currentPage;           // 현재 페이지
    }
}


