package com.kh.cookmate.admin.service;

import java.util.List;
import java.util.Map;

import com.kh.cookmate.admin.dto.AdminDto;
import com.kh.cookmate.admin.dto.AdminDto.ReportDetailDto;
import com.kh.cookmate.admin.dto.AdminDto.UserCommentDto;
import com.kh.cookmate.admin.dto.AdminDto.UserLogDto;
import com.kh.cookmate.admin.dto.AdminDto.UserRecipeDto;
import com.kh.cookmate.admin.dto.AdminDto.UserReportDto;
import com.kh.cookmate.admin.dto.AdminDto.UserSuspendRequestDto;

public interface AdminService {
	
	// 대시보드
	AdminDto getDashboard();

	// Get
	Map<String, Object> getUsers(AdminDto.UserSearchDto condition);
    Map<String, Object> getReports(AdminDto.ReportSearchDto condition);
    Map<String, Object> getRecipes(AdminDto.RecipeSearchDto condition);
    Map<String, Object> getNotices(AdminDto.NoticeSearchDto condition);
    Map<String, Object> getInquiries(AdminDto.InquirySearchDto condition);
    
    boolean processReport(long reportId, AdminDto.ReportProcessRequestDto request);
    boolean hideRecipe(int recipeId);
    boolean restoreRecipe(int recipeId);
    
    // Notice
    boolean createNotice(AdminDto.NoticeDto notice);
    boolean updateNotice(AdminDto.NoticeDto notice);
    boolean deleteNotice(long noticeId);
    boolean answerInquiry(AdminDto.InquiryAnswerDto request);

	AdminDto.UserDetailDto getUserDetail(int userId);

	// GetUser
	Map<String, Object> getUserRecipe(int userId, UserRecipeDto dto);
	Map<String, Object> getUserComment(int userId, UserCommentDto dto);
	Map<String, Object> getUserReport(int userId,UserReportDto dto);
	Map<String, Object> getUserLog(int userId,UserLogDto dto);
	
	boolean suspendUser(int userId, UserSuspendRequestDto request);
	boolean releaseUserBan(int userId);
	boolean withdrawUser(int userId);
	Map<String, Integer> expireTimedStatuses();

	ReportDetailDto getReportDetail(long reportId);


	
	//List<usersDto> getUsers();
}
