package com.kh.cookmate.admin.dao;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Param;

import com.kh.cookmate.admin.dto.AdminDto.InquiryAnswerDto;
import com.kh.cookmate.admin.dto.AdminDto.InquiryDto;
import com.kh.cookmate.admin.dto.AdminDto.InquirySearchDto;
import com.kh.cookmate.admin.dto.AdminDto.NoticeDto;
import com.kh.cookmate.admin.dto.AdminDto.NoticeSearchDto;
import com.kh.cookmate.admin.dto.AdminDto.RecipeDto;
import com.kh.cookmate.admin.dto.AdminDto.RecipeSearchDto;
import com.kh.cookmate.admin.dto.AdminDto.ReportDetailDto;
import com.kh.cookmate.admin.dto.AdminDto.ReportDto;
import com.kh.cookmate.admin.dto.AdminDto.ReportProcessRequestDto;
import com.kh.cookmate.admin.dto.AdminDto.ReportSearchDto;
import com.kh.cookmate.admin.dto.AdminDto.UserCommentDto;
import com.kh.cookmate.admin.dto.AdminDto.UserDetailDto;
import com.kh.cookmate.admin.dto.AdminDto.UserLogDto;
import com.kh.cookmate.admin.dto.AdminDto.UserPageDto;
import com.kh.cookmate.admin.dto.AdminDto.UserRecipeDto;
import com.kh.cookmate.admin.dto.AdminDto.UserReportDto;
import com.kh.cookmate.admin.dto.AdminDto.UserSearchDto;
import com.kh.cookmate.admin.dto.AdminDto.UserSuspendRequestDto;

public interface AdminDao {

	// =================== 대시 보드 영역 =====================
	int countAllUsers();
	int countAllRecipes();
	int countPendingReports();
	int countUnansweredInquiries();
	int countTodayVisitors();
	int countTodayScrap();
	int countTodayComments();
	int countMonthlyBannedUsers();
	int countActiveNotices();
	
	int countTodayUsersDiff();
	int countTodayRecipesDiff();

	List<ReportDto> selectRecentReports();
	List<RecipeDto> selectTopRecipes();
	List<InquiryDto> selectUnansweredInquiries();

	String selectNotice();
	// ==========================================================

	
	List<UserPageDto> selectUserList(UserSearchDto condition);
	int selectUserCount(UserSearchDto condition);

	List<ReportDto> selectReportList(ReportSearchDto condition);
	int selectUnansweredReportCount(ReportSearchDto condition);
	ReportDetailDto selectReportDetail(long reportId);
	int processReport(ReportProcessRequestDto request);
	int hideReportedBoard(ReportProcessRequestDto request);
	int deleteReportedBoard(ReportProcessRequestDto request);
	int hideReportedComment(ReportProcessRequestDto request);
	int deleteReportedComment(ReportProcessRequestDto request);
	int increaseReporteeWarning(long reportId);

	List<RecipeDto> selectRecipeList(RecipeSearchDto condition);
	int selectRecipeCount(RecipeSearchDto condition);
	int hideRecipe(int recipeId);
	int restoreRecipe(int recipeId);

	List<NoticeDto> selectNoticeList(NoticeSearchDto condition);
	int selectNoticeCount(NoticeSearchDto condition);
	int insertNotice(NoticeDto notice);
	int updateNotice(NoticeDto notice);
	int deleteNotice(long noticeId);

	List<InquiryDto> selectInquiryList(InquirySearchDto condition);
	int selectUnansweredInquiryCount(InquirySearchDto condition);
	int answerInquiry(InquiryAnswerDto request);

	UserDetailDto selectUserDetail(int userId);

	// UserDetail user/{userId}
	List<UserRecipeDto> selectUserRecipe(Map<String, Object> paramMap);
	List<UserCommentDto> selectUserComment(Map<String, Object> paramMap);
	List<UserReportDto> selectUserReport(Map<String, Object> paramMap);
	List<UserLogDto> selectUserLog(Map<String, Object> paramMap);
	
	int selectUserRecipeCount(int userId);
	int selectUserCommentCount(int userId);
	int selectUserLogCount(int userId);
	int selectUserReportCount(int userId);
	
	
	
	int selectTotalReportCount(ReportSearchDto condition);
	int selectTotalInquiryCount(InquirySearchDto condition);
	
	int insertUserBan(UserSuspendRequestDto request);
	int updateUserStatus(Map<String, Object> paramMap);
	int releaseUserBan(int userId);
	int withdrawUser(int userId);
	
	// 스케줄링
	int updateExpiredBanUsers();
	int deactivateExpiredBans();
	int closeExpiredNotices();
	
	int selectReportedCount(long reportId);

	
	
//	ReportDetailDto getReportDetail(long reportId);
//	int getUserReportCount(Long reporteeNo);



}
