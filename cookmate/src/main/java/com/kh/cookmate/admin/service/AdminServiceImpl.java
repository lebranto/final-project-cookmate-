package com.kh.cookmate.admin.service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.kh.cookmate.admin.dao.AdminDao;
import com.kh.cookmate.admin.dto.AdminDto;
import com.kh.cookmate.admin.dto.AdminDto.ReportDetailDto;
import com.kh.cookmate.admin.dto.AdminDto.UserCommentDto;
import com.kh.cookmate.admin.dto.AdminDto.UserDetailDto;
import com.kh.cookmate.admin.dto.AdminDto.UserLogDto;
import com.kh.cookmate.admin.dto.AdminDto.UserRecipeDto;
import com.kh.cookmate.admin.dto.AdminDto.UserReportDto;
import com.kh.cookmate.admin.dto.AdminDto.UserSearchDto;
import com.kh.cookmate.admin.dto.AdminDto.UserSuspendRequestDto;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService{
	
	private final AdminDao adminDao;

	@Override
    public AdminDto getDashboard() {
		// DTO는 매번 새로 생성해서 반환해야 안전합니다.
        AdminDto DTO = new AdminDto();
        
        DTO.setTotalUsers(adminDao.countAllUsers());
        DTO.setTotalRecipes(adminDao.countAllRecipes());
        DTO.setPendingReports(adminDao.countPendingReports());
        DTO.setUnansweredInquiries(adminDao.countUnansweredInquiries());
        
        DTO.setTodayUserDiff(adminDao.countTodayUsersDiff());
        DTO.setTodayRecipeDiff(adminDao.countTodayRecipesDiff());

        DTO.setTodayVisitors(adminDao.countTodayVisitors());
        DTO.setTodayLikes(adminDao.countTodayScrap());
        DTO.setTodayComments(adminDao.countTodayComments());

        DTO.setMonthlyBannedUsers(adminDao.countMonthlyBannedUsers());
        
        DTO.setActiveNotices(adminDao.countActiveNotices());

        DTO.setRecentReports(adminDao.selectRecentReports());
        DTO.setTopRecipes(adminDao.selectTopRecipes());
        DTO.setUnansweredInquiryList(adminDao.selectUnansweredInquiries());

        DTO.setNotice(adminDao.selectNotice());

        return DTO;
    }

	@Override
    public Map<String, Object> getUsers(UserSearchDto condition) {
        // 1. 검색 결과 리스트 조회 
        List<AdminDto.UserPageDto> userList = adminDao.selectUserList(condition);
        
        // 2. 검색 조건에 맞는 전체 게시글 수 조회 (페이지네이션 계산용)
        int totalCount = adminDao.selectUserCount(condition);
        
        // 3. 화면에 필요한 데이터들을 묶어서 반환
        Map<String, Object> response = new HashMap<>();
        response.put("userList", userList);
        response.put("totalCount", totalCount);
        response.put("totalPages", calculateTotalPages(totalCount, condition.getSize()));
        response.put("currentPage", condition.getPage());
        // 필요 시 계산 로직 추가 (예: 시작 페이지, 끝 페이지 등)
        
        return response;
    }

	@Override
    public Map<String, Object> getReports(AdminDto.ReportSearchDto condition) {
        List<AdminDto.ReportDto> reportList = adminDao.selectReportList(condition);
        int totalUnansweredReportCount = adminDao.selectUnansweredReportCount(condition);
        int totalReportCount = adminDao.selectTotalReportCount(condition);

        Map<String, Object> response = new HashMap<>();
        response.put("reportList", reportList);
        response.put("totalUnansweredReportCount", totalUnansweredReportCount);
        response.put("totalReportCount", totalReportCount);
        response.put("totalPages", calculateTotalPages(totalReportCount, condition.getSize()));
        response.put("currentPage", condition.getPage());
        return response;
    }

	@Override
	public ReportDetailDto getReportDetail(long reportId) {

	    ReportDetailDto dto = adminDao.selectReportDetail(reportId);

	    System.out.println("reporteeNo = " + dto.getReporteeNo());

	    int reportedCount = adminDao.selectReportedCount(dto.getReporteeNo());

	    System.out.println("reportedCount = " + reportedCount);

	    dto.setReportedCount(reportedCount);

	    return dto;
	}

	@Override
	@Transactional
	public boolean processReport(long reportId, AdminDto.ReportProcessRequestDto request) {
		if (request == null || request.getAction() == null || request.getAction().isBlank()) {
			throw new IllegalArgumentException("처리 액션은 필수입니다.");
		}

		request.setReportId(reportId);
		String action = request.getAction();
		String targetKind = request.getTargetKind();
		boolean isComment = "COMMENT".equalsIgnoreCase(targetKind);

		if ("HIDE".equalsIgnoreCase(action)) {
			if (isComment) {
				adminDao.hideReportedComment(request);
			} else {
				adminDao.hideReportedBoard(request);
			}
		} else if ("DELETE".equalsIgnoreCase(action)) {
			if (isComment) {
				adminDao.deleteReportedComment(request);
			} else {
				adminDao.deleteReportedBoard(request);
			}
		} else if ("WARN".equalsIgnoreCase(action)) {
			adminDao.increaseReporteeWarning(reportId);
		} else if (!"REJECT".equalsIgnoreCase(action)) {
			throw new IllegalArgumentException("지원하지 않는 신고 처리 액션입니다.");
		}

		return adminDao.processReport(request) > 0;
	}

	@Override
    public Map<String, Object> getRecipes(AdminDto.RecipeSearchDto condition) {
        List<AdminDto.RecipeDto> recipeList = adminDao.selectRecipeList(condition);
        int totalCount = adminDao.selectRecipeCount(condition);

        Map<String, Object> response = new HashMap<>();
        response.put("recipeList", recipeList);
        response.put("totalCount", totalCount);
        response.put("totalPages", calculateTotalPages(totalCount, condition.getSize()));
        response.put("currentPage", condition.getPage());
        return response;
	}

	@Override
	public boolean hideRecipe(int recipeId) {
		return adminDao.hideRecipe(recipeId) > 0;
	}

	@Override
	public boolean restoreRecipe(int recipeId) {
		return adminDao.restoreRecipe(recipeId) > 0;
	}

    @Override
    public Map<String, Object> getNotices(AdminDto.NoticeSearchDto condition) {
        List<AdminDto.NoticeDto> noticeList = adminDao.selectNoticeList(condition);
        int totalCount = adminDao.selectNoticeCount(condition);

        Map<String, Object> response = new HashMap<>();
        response.put("noticeList", noticeList);
        response.put("totalCount", totalCount);
        response.put("totalPages", calculateTotalPages(totalCount, condition.getSize()));
        response.put("currentPage", condition.getPage());
        return response;
    }

    @Override
    public boolean createNotice(AdminDto.NoticeDto notice) {
        validateNoticePeriod(notice);

        if (notice.getStatus() == null || notice.getStatus().isBlank()) {
            notice.setStatus("Y");
        }
        if (notice.getTypeName() == null || notice.getTypeName().isBlank()) {
            notice.setTypeName("일반");
        }
        if (notice.getUserNo() == null) {
            notice.setUserNo(1L);
        }

        return adminDao.insertNotice(notice) > 0;
    }

    @Override
    public boolean updateNotice(AdminDto.NoticeDto notice) {
        validateNoticePeriod(notice);
        return adminDao.updateNotice(notice) > 0;
    }

    private void validateNoticePeriod(AdminDto.NoticeDto notice) {
        String startDate = notice.getStartDate();
        String endDate = notice.getEndDate();

        if (startDate == null || startDate.isBlank() || endDate == null || endDate.isBlank()) {
            return;
        }

        if (LocalDate.parse(endDate).isBefore(LocalDate.parse(startDate))) {
            throw new IllegalArgumentException("공지 종료일은 시작일보다 빠를 수 없습니다.");
        }
    }

    @Override
    public boolean deleteNotice(long noticeId) {
        return adminDao.deleteNotice(noticeId) > 0;
    }

    @Override
    public Map<String, Object> getInquiries(AdminDto.InquirySearchDto condition) {
        List<AdminDto.InquiryDto> inquiryList = adminDao.selectInquiryList(condition);
        int totalUnansweredInquiryCount = adminDao.selectUnansweredInquiryCount(condition);
        int totalInquiryCount = adminDao.selectTotalInquiryCount(condition);

        Map<String, Object> response = new HashMap<>();
        response.put("inquiryList", inquiryList);
        response.put("totalInquiryCount", totalInquiryCount);
        response.put("totalUnansweredInquiryCount", totalUnansweredInquiryCount);
        response.put("totalPages", calculateTotalPages(totalUnansweredInquiryCount, condition.getSize()));
        response.put("currentPage", condition.getPage());
        return response;
    }

    @Override
    public boolean answerInquiry(AdminDto.InquiryAnswerDto request) {
        return adminDao.answerInquiry(request) > 0;
    }

    // ── 공통 유틸 ──────────────────────────────────────────
    private int calculateTotalPages(int totalCount, int size) {
        if (size <= 0) return 0;
        return (int) Math.ceil((double) totalCount / size);
    }
    
	@Override
	public UserDetailDto getUserDetail(int userId) {
		return adminDao.selectUserDetail(userId);
	}

	@Override
	public Map<String, Object> getUserRecipe(int userId, UserRecipeDto dto) {

	    Map<String, Object> paramMap = new HashMap<>();

	    paramMap.put("userId", userId);
	    paramMap.put("page", dto.getPage());
	    paramMap.put("size", dto.getSize());
	    paramMap.put("offset", dto.getOffset());

	    List<UserRecipeDto> list = adminDao.selectUserRecipe(paramMap);

	    int totalCount = adminDao.selectUserRecipeCount(userId);

	    Map<String, Object> result = new HashMap<>();

	    result.put("list", list);
	    result.put("totalCount", totalCount);

	    return result;
	}
	
	@Override
	public Map<String, Object> getUserComment(int userId, UserCommentDto dto) {
		Map<String, Object> paramMap = new HashMap<>();

	    paramMap.put("userId", userId);
	    paramMap.put("page", dto.getPage());
	    paramMap.put("size", dto.getSize());
	    paramMap.put("offset", dto.getOffset());

	    List<UserCommentDto> list = adminDao.selectUserComment(paramMap);

	    int totalCount = adminDao.selectUserCommentCount(userId);

	    Map<String, Object> result = new HashMap<>();

	    result.put("list", list);
	    result.put("totalCount", totalCount);

	    return result;
	}

	@Override
	public Map<String, Object> getUserReport(int userId , UserReportDto dto) {
		Map<String, Object> paramMap = new HashMap<>();

	    paramMap.put("userId", userId);
	    paramMap.put("page", dto.getPage());
	    paramMap.put("size", dto.getSize());
	    paramMap.put("offset", dto.getOffset());

	    List<UserReportDto> list = adminDao.selectUserReport(paramMap);

	    int totalCount = adminDao.selectUserReportCount(userId);

	    Map<String, Object> result = new HashMap<>();

	    result.put("list", list);
	    result.put("totalCount", totalCount);

	    return result;
	}

	@Override
	public Map<String, Object> getUserLog(int userId , UserLogDto dto) {
		Map<String, Object> paramMap = new HashMap<>();

	    paramMap.put("userId", userId);
	    paramMap.put("page", dto.getPage());
	    paramMap.put("size", dto.getSize());
	    paramMap.put("offset", dto.getOffset());

	    List<UserLogDto> list = adminDao.selectUserLog(paramMap);

	    int totalCount = adminDao.selectUserLogCount(userId);

	    Map<String, Object> result = new HashMap<>();

	    result.put("list", list);
	    result.put("totalCount", totalCount);

	    return result;
	}

	@Override
	@Transactional
	public boolean suspendUser(int userId, UserSuspendRequestDto request) {
		if (request == null || request.getReason() == null || request.getReason().isBlank()) {
			throw new IllegalArgumentException("정지 사유는 필수입니다.");
		}

		if (request.getBanType() == null || request.getBanType().isBlank()) {
			request.setBanType(request.getDays() == 0 ? "PERMANENT" : "TEMPORARY");
		}

		adminDao.releaseUserBan(userId);

		Map<String, Object> statusParam = new HashMap<>();
		statusParam.put("userId", userId);
		statusParam.put("status", "B");

		request.setUserId(userId);
		return adminDao.insertUserBan(request) > 0 && adminDao.updateUserStatus(statusParam) > 0;
	}

	@Override
	@Transactional
	public boolean releaseUserBan(int userId) {
		Map<String, Object> statusParam = new HashMap<>();
		statusParam.put("userId", userId);
		statusParam.put("status", "N");

		int released = adminDao.releaseUserBan(userId);
		int updated = adminDao.updateUserStatus(statusParam);

		return released > 0 || updated > 0;
	}

	@Override
	@Transactional
	public boolean withdrawUser(int userId) {
		adminDao.releaseUserBan(userId);
		return adminDao.withdrawUser(userId) > 0;
	}

	@Override
	@Transactional
	public Map<String, Integer> expireTimedStatuses() {
		int releasedUsers = adminDao.updateExpiredBanUsers();
		int releasedBans = adminDao.deactivateExpiredBans();
		int closedNotices = adminDao.closeExpiredNotices();

		Map<String, Integer> result = new HashMap<>();
		result.put("releasedUsers", releasedUsers);
		result.put("releasedBans", releasedBans);
		result.put("closedNotices", closedNotices);

		return result;
	}


	
}
