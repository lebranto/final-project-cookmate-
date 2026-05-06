package com.kh.cookmate.admin.dao;

import java.util.List;

import com.kh.cookmate.admin.dto.AdminDto.InquiryDto;
import com.kh.cookmate.admin.dto.AdminDto.RecipeDto;
import com.kh.cookmate.admin.dto.AdminDto.ReportDto;
import com.kh.cookmate.admin.dto.AdminDto.UserPageDto;
import com.kh.cookmate.admin.dto.AdminDto.UserSearchDto;

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

	List<ReportDto> selectRecentReports();

	List<RecipeDto> selectTopRecipes();

	List<InquiryDto> selectUnansweredInquiries();

	String selectNotice();
	// =================== 대시 보드 영역 끝 ===================

	List<UserPageDto> selectUserList(UserSearchDto condition);

	int selectUserCount(UserSearchDto condition);
}
