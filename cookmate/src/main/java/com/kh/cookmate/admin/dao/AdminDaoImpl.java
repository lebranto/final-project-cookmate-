package com.kh.cookmate.admin.dao;

import java.util.List;

import org.mybatis.spring.SqlSessionTemplate;
import org.springframework.stereotype.Repository;

import com.kh.cookmate.admin.dto.AdminDto.InquiryDto;
import com.kh.cookmate.admin.dto.AdminDto.RecipeDto;
import com.kh.cookmate.admin.dto.AdminDto.ReportDto;
import com.kh.cookmate.admin.dto.AdminDto.UserPageDto;
import com.kh.cookmate.admin.dto.AdminDto.UserSearchDto;

import lombok.RequiredArgsConstructor;

@Repository
@RequiredArgsConstructor
public class AdminDaoImpl implements AdminDao{

	private final SqlSessionTemplate session;
	
	// =================== 대시 보드 영역 =====================
	@Override
	public int countAllUsers() {
	    return session.selectOne("admin.countAllUsers");
	}

	@Override
	public int countAllRecipes() {
		return session.selectOne("admin.countAllRecipes");
	}

	@Override
	public int countPendingReports() {
		return session.selectOne("admin.countPendingReport");
	}

	@Override
	public int countUnansweredInquiries() {
		return session.selectOne("admin.countUnansweredInquiries");
	}

	@Override
	public int countTodayVisitors() {
		return session.selectOne("admin.countTodayVisitors");
	}

	@Override
	public int countTodayScrap() {
		return session.selectOne("admin.countTodayScrap");
	}

	@Override
	public int countTodayComments() {
		return session.selectOne("admin.countTodayComments");
	}

	@Override
	public int countMonthlyBannedUsers() {
		return session.selectOne("admin.countMonthlyBannedUsers");
	}

	@Override
	public List<ReportDto> selectRecentReports() {
		return session.selectList("admin.selectRecentReports");
	}

	@Override
	public List<RecipeDto> selectTopRecipes() {
		return session.selectList("admin.selectTopRecipes");
	}

	@Override
	public List<InquiryDto> selectUnansweredInquiries() {
		return session.selectList("admin.selectUnansweredInquiries");
	}

	@Override
	public String selectNotice() {
		// TODO Auto-generated method stub
		return null;
	}
	// =================== 대시 보드 영역 끝 ===================

	@Override
	public List<UserPageDto> selectUserList(UserSearchDto condition) {
		return session.selectList("admin.selectUserList" , condition);
	}

	@Override
	public int selectUserCount(UserSearchDto condition) {
		return session.selectOne("admin.selectUserCount" , condition);
	}
	
	
}
