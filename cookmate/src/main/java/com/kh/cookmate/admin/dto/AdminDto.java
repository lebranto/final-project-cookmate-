package com.kh.cookmate.admin.dto;

import java.util.Date;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
public class AdminDto {

	// 대시보드 
	
    // 숫자 카드 영역
    private int totalUsers;
    private int totalRecipes;
    private int pendingReports;
    private int unansweredInquiries;
    
    private int todayUserDiff;
    private int todayRecipeDiff;
    
    // 하단 상세 통계 (오늘의 수치)
    private int todayVisitors;
    private int todayLikes;
    private int todayComments;
    private int monthlyBannedUsers;
    private int activeNotices;

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
        private String targetNickname;
        private String reporterId;  // 신고자 ID 추가
        private String reason;
        private String status;         // PENDING / RESOLVED
        private String createdAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReportDetailDto {
        private Long reportId;
        private String reportType;
        private Long reporterNo;
        private String reporterNickname;
        private String reporterEmail;
        private Long reporteeNo;
        private String reporteeNickname;
        private String reporteeEmail;
        private int reporteeWarning;
        private int reportedCount;
        private String reason;
        private String status;
        private String createdAt;
        private String targetKind;
        private Long targetContentId;
        private String targetTitle;
        private String targetContent;
        private String processedAt;
        private String processAction;
        private String processReason;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReportProcessRequestDto {
        private Long reportId;
        private String action;
        private String reason;
        private String targetKind;
        private Long targetContentId;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecipeDto {

        private Long boardNo;
        private String title;
        private String author;
        private int likeCount;
//        private int viewCount;
        private int typeNo;
        private String status;
        private String createdAt;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InquiryDto {

        private Long inquiryId;
        private Long userNo;
        private String userId;
        private String title;
        private String content;
        private String typeName;
        private String writer;
        private String email;
        private String status;     // ANSWERED / UNANSWERED
        private String createdAt;
        private String answer;
        private String answerDate;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InquiryAnswerDto {
        private Long inquiryId;
        private String answer;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserPageDto { // 내부 클래스일 경우 static 권장
        private Long userId;        // 번호 (#1, #2...)
        private String profileImageUrl; // 프로필 이미지
        private String nickname;    // 닉네임 (화면에 '닉네임'으로 표시됨)
        private String email;       // 이메일
        private String role;        // 등급 (관리자, 일반)
        private int recipeCount;    // 레시피 수 (이미지에 포함된 필드 )
        private Date enrollDate;    // 가입일
        private String status;      // 상태 (정상, 정지, 경고)
        private String withdraw;
        
    }
    
    @Data
    public static class UserSearchDto {
        private String keyword;    // 이름, 이메일, 닉네임 검색어
        private String status;     // 전체 상태 (정상, 정지, 경고 등)
        private String role;       // 전체 등급 (관리자, 일반 등)
        private String sort;    // 가입일 최신순, 레시피 많은 순 등
        private int page = 1;      // 현재 페이지 번호
        private int size = 10;     // 한 페이지당 보여줄 게시글 수
        private int offset;
    }
    
    @Data
    public static class UserListResponse {
        private List<UserPageDto> userList; // 회원 목록
        private long totalElements;         // 총 회원 수 
        private int totalPages;            // 총 페이지 수 
        private int currentPage;           // 현재 페이지
    }
    
    @Data
    public static class UserDetailDto {
        // 회원 기본 정보
        private int userId;
        private String nickname;
        private String email;
        private String enrollDate;
        private String status;
        private String withdraw;
        private String role;
        private String lastLogin;
        private String profileImageUrl;
        //private String lastLoginIp;

        // 통계 정보 (추가된 부분)
        private int boardCount;   // 쓴 레시피 수 (BOARD 테이블)
        private int commentCount; // 쓴 댓글 수 (COMMENT 테이블)
        private int scrapCount;   // 쓴 스크랩 수 (SCRAP 테이블)
        private int reportCount;  // 누적 신고 수 (필요시)
    }
    
    @Data
    public static class ReportSearchDto {
        private String reportType;   // 신고 유형 필터
        private String status;       // PENDING / RESOLVED
        private String orderBy;
        private String keyword;      // 신고자 or 대상 검색어
        private int page = 1;
        private int size = 10;
        private int offset;
    }

    @Data
    public static class RecipeSearchDto {
        private String keyword;      // 제목, 작성자 검색어
        private Integer typeNo;
        private String orderBy;      // 최신순, 좋아요순, 조회수순
        private String status;       // N: 게시중, Y: 비공개
        private int page = 1;
        private int size = 10;
        private int offset;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NoticeDto {
        private Long noticeId;
        private Long userNo;
        private String title;
        private String content;
        private String typeName;
        private String startDate;
        private String endDate;
        private String modifiedDate;
        private String status;       // Y: 게시중, N: 종료
        private String deleteYn;
    }

    @Data
    public static class NoticeSearchDto {
        private String keyword;      // 제목 검색어
        private String typeName;     // 공지 유형
        private String status;       // Y: 게시중, N: 종료
        private int page = 1;
        private int size = 10;
        private int offset;
    }

    @Data
    public static class InquirySearchDto {
        private String keyword;      // 제목, 유저ID 검색어
        private String typeName;
        private String status;       // ANSWERED / UNANSWERED
        private int page = 1;
        private int size = 10;
        private int offset;
    }
    
    // ========== 유저 관리 =============
    @Data
    public static class UserRecipeDto {
        private int boardId;
        private String title;
        private int likeCount;
        private String createdAt;
        private String status;
        private int page = 1;
        private int size = 10;
        private int offset;
    }
    
    @Data
    public static class UserCommentDto {
        private int commentId;

        private String content;
        private String createdAt;
        private String status;
        private int page = 1;
        private int size = 10;
        private int offset;
    }
    
    @Data
    public static class UserReportDto {
        private int reportId;
        private String reportType;
        private String reason;
        private String state;
        private String createdAt;
        private int page = 1;
        private int size = 10;
        private int offset;
    }
    
    @Data
    public static class UserLogDto {
        private int banId;
        private int userNo;
        private String reason;
        private String banType;
        private String banStart;
        private String banEnd;
        private String banActice;
        private int page = 1;
        private int size = 10;
        private int offset;
    }
    
    @Data
    public static class UserSuspendRequestDto {
        private int userId;
        private int days;
        private String reason;
        private String banType;
    }
    
    @Data
    public static class UserWithdrawRequestDto {
        private String reason;
    }
    
}

