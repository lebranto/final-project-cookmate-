package com.kh.cookmate.admin.dao;

import java.util.List;
import java.util.Map;

import org.mybatis.spring.SqlSessionTemplate;
import org.springframework.stereotype.Repository;

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
	public int countTodayUsersDiff() {
		return session.selectOne("admin.countTodayUsersDiff");
	}

	@Override
	public int countTodayRecipesDiff() {
		return session.selectOne("admin.countTodayRecipesDiff");
	}


	@Override
	public int countPendingReports() {
		return session.selectOne("admin.countPendingReports");
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
	public int countActiveNotices() {
		return session.selectOne("admin.countActiveNotices");
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

	@Override
	public List<ReportDto> selectReportList(ReportSearchDto condition) {
		return session.selectList("admin.selectReportList" , condition);
	}

	@Override
	public int selectUnansweredReportCount(ReportSearchDto condition) {
		return session.selectOne("admin.selectUnansweredReportCount" , condition);
	}

	@Override
	public ReportDetailDto selectReportDetail(long reportId) {
		return session.selectOne("admin.selectReportDetail", reportId);
	}

	@Override
	public int processReport(ReportProcessRequestDto request) {
		return session.update("admin.processReport", request);
	}

	@Override
	public int hideReportedBoard(ReportProcessRequestDto request) {
		return session.update("admin.hideReportedBoard", request);
	}

	@Override
	public int deleteReportedBoard(ReportProcessRequestDto request) {
		return session.update("admin.deleteReportedBoard", request);
	}

	@Override
	public int hideReportedComment(ReportProcessRequestDto request) {
		return session.update("admin.hideReportedComment", request);
	}

	@Override
	public int deleteReportedComment(ReportProcessRequestDto request) {
		return session.update("admin.deleteReportedComment", request);
	}

	@Override
	public int increaseReporteeWarning(long reportId) {
		return session.update("admin.increaseReporteeWarning", reportId);
	}

	@Override
	public List<RecipeDto> selectRecipeList(RecipeSearchDto condition) {
		return session.selectList("admin.selectRecipeList" , condition);
	}

	@Override
	public int selectRecipeCount(RecipeSearchDto condition) {
		return session.selectOne("admin.selectRecipeCount" , condition);
	}

	@Override
	public int hideRecipe(int boardNo) {
		return session.update("admin.hideRecipe", boardNo);
	}

	@Override
	public int restoreRecipe(int boardNo) {
		return session.update("admin.restoreRecipe", boardNo);
	}

	@Override
	public List<NoticeDto> selectNoticeList(NoticeSearchDto condition) {
		return session.selectList("admin.selectNoticeList" , condition);
	}

	@Override
	public int selectNoticeCount(NoticeSearchDto condition) {
		return session.selectOne("admin.selectNoticeCount" , condition);
	}

	@Override
	public int insertNotice(NoticeDto notice) {
		return session.insert("admin.insertNotice", notice);
	}

	@Override
	public int updateNotice(NoticeDto notice) {
		return session.update("admin.updateNotice", notice);
	}

	@Override
	public int deleteNotice(long noticeId) {
		return session.update("admin.deleteNotice", noticeId);
	}

	@Override
	public List<InquiryDto> selectInquiryList(InquirySearchDto condition) {
		return session.selectList("admin.selectInquiryList" , condition);
	}

	@Override
	public int selectUnansweredInquiryCount(InquirySearchDto condition) {
		return session.selectOne("admin.selectUnansweredInquiryCount" , condition);
	}

	@Override
	public int answerInquiry(InquiryAnswerDto request) {
		return session.update("admin.answerInquiry", request);
	}

	
	// ================= 회원 상세 페이지 =======================
	@Override
	public List<UserRecipeDto> selectUserRecipe(Map<String, Object> paramMap) {
		return session.selectList("admin.selectUserRecipe",paramMap);
	}

	@Override
	public List<UserCommentDto> selectUserComment(Map<String, Object> paramMap) {
		return session.selectList("admin.selectUserComment",paramMap);
	}

	@Override
	public List<UserReportDto> selectUserReport(Map<String, Object> paramMap) {
		return session.selectList("admin.selectUserReport",paramMap);
	}

	@Override
	public List<UserLogDto> selectUserLog(Map<String, Object> paramMap) {
		return session.selectList("admin.selectUserLog",paramMap);
	}

	@Override
	public int selectUserRecipeCount(int userId) {
		return session.selectOne("admin.selectUserRecipeCount",userId);
	}

	@Override
	public int selectUserCommentCount(int userId) {
		return session.selectOne("admin.selectUserCommentCount",userId);
	}

	@Override
	public int selectUserLogCount(int userId) {
		return session.selectOne("admin.selectUserLogCount",userId);
	}

	@Override
	public UserDetailDto selectUserDetail(int userId) {
		return session.selectOne("admin.selectUserDetail",userId);
	}

	@Override
	public int selectUserReportCount(int userId) {
		return session.selectOne("admin.selectUserReportCount",userId);
	}

	@Override
	public int selectTotalReportCount(ReportSearchDto condition) {
		Integer count = session.selectOne("admin.selectTotalReportCount");

		return count != null ? count : 0;
	}
	
	@Override
	public int selectTotalInquiryCount(InquirySearchDto condition) {
		Integer count = session.selectOne("admin.selectTotalInquiryCount");

		return count != null ? count : 0;
	}
	

	@Override
	public int insertUserBan(UserSuspendRequestDto request) {
		return session.insert("admin.insertUserBan", request);
	}

	@Override
	public int updateUserStatus(Map<String, Object> paramMap) {
		return session.update("admin.updateUserStatus", paramMap);
	}

	@Override
	public int releaseUserBan(int userId) {
		return session.update("admin.releaseUserBan", userId);
	}

	@Override
	public int withdrawUser(int userId) {
		return session.update("admin.withdrawUser", userId);
	}

	@Override
	public int updateExpiredBanUsers() {
		return session.update("admin.updateExpiredBanUsers");
	}

	@Override
	public int deactivateExpiredBans() {
		return session.update("admin.deactivateExpiredBans");
	}

	@Override
	public int closeExpiredNotices() {
		return session.update("admin.closeExpiredNotices");
	}

	@Override
	public int selectReportedCount(long reportId) {
		return session.selectOne("admin.selectReportedCount", reportId);
	}
	
}
