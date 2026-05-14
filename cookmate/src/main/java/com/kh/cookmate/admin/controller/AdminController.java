package com.kh.cookmate.admin.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kh.cookmate.admin.dto.AdminDto;
import com.kh.cookmate.admin.dto.AdminDto.InquiryAnswerDto;
import com.kh.cookmate.admin.dto.AdminDto.NoticeDto;
import com.kh.cookmate.admin.dto.AdminDto.InquirySearchDto;
import com.kh.cookmate.admin.dto.AdminDto.NoticeSearchDto;
import com.kh.cookmate.admin.dto.AdminDto.RecipeSearchDto;
import com.kh.cookmate.admin.dto.AdminDto.ReportDetailDto;
import com.kh.cookmate.admin.dto.AdminDto.ReportProcessRequestDto;
import com.kh.cookmate.admin.dto.AdminDto.ReportSearchDto;
import com.kh.cookmate.admin.dto.AdminDto.UserCommentDto;
import com.kh.cookmate.admin.dto.AdminDto.UserDetailDto;
import com.kh.cookmate.admin.dto.AdminDto.UserLogDto;
import com.kh.cookmate.admin.dto.AdminDto.UserRecipeDto;
import com.kh.cookmate.admin.dto.AdminDto.UserReportDto;
import com.kh.cookmate.admin.dto.AdminDto.UserSearchDto;
import com.kh.cookmate.admin.dto.AdminDto.UserSuspendRequestDto;
import com.kh.cookmate.admin.dto.AdminDto.UserWithdrawRequestDto;
import com.kh.cookmate.admin.service.AdminService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/admin")
public class AdminController {
	
	private final AdminService adminService;
	
	@GetMapping("/dashboard")
	public ResponseEntity<AdminDto> dashboard(){

	    AdminDto dto = adminService.getDashboard();

	    return ResponseEntity.ok(dto);
	}
	
	@GetMapping("/user")
	public ResponseEntity<Map<String, Object>> getUsers(UserSearchDto dto) {
		
		dto.setOffset((dto.getPage() - 1) * dto.getSize());
		
	    return ResponseEntity.ok(adminService.getUsers(dto));
	}
	
	@GetMapping("/user/{userId}")
    public ResponseEntity<UserDetailDto> getUserDetail(@PathVariable("userId") int userId) {
        AdminDto.UserDetailDto userDetail = adminService.getUserDetail(userId);
        
        if (userDetail != null) {
            return ResponseEntity.ok(userDetail);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
	
	@GetMapping("/user/{userId}/board")
	public ResponseEntity<Map<String, Object>> getUserRecipes(
	        @PathVariable int userId,
	        AdminDto.UserRecipeDto dto) {

	    dto.setOffset((dto.getPage() - 1) * dto.getSize());

	    Map<String, Object> result =
	            adminService.getUserRecipe(userId, dto);

	    return ResponseEntity.ok(result);
	}
	
	@GetMapping("/user/{userId}/comment")
	public ResponseEntity<Map<String, Object>> getUserComments(
	        @PathVariable int userId,
	        AdminDto.UserCommentDto dto) {

	    dto.setOffset((dto.getPage() - 1) * dto.getSize());

	    return ResponseEntity.ok(
	            adminService.getUserComment(userId, dto)
	    );
	}
	
	@GetMapping("/user/{userId}/report")
	public ResponseEntity<Map<String, Object>> getUserReports(
	        @PathVariable int userId,
	        AdminDto.UserReportDto dto) {

	    dto.setOffset((dto.getPage() - 1) * dto.getSize());

	    return ResponseEntity.ok(
	            adminService.getUserReport(userId, dto)
	    );
	}
	
	@GetMapping("/user/{userId}/log")
	public ResponseEntity<Map<String, Object>> getUserLogs(
	        @PathVariable int userId,
	        AdminDto.UserLogDto dto) {

	    dto.setOffset((dto.getPage() - 1) * dto.getSize());

	    return ResponseEntity.ok(
	            adminService.getUserLog(userId, dto)
	    );
	}

	@PostMapping("/user/{userId}/suspend")
	public ResponseEntity<Void> suspendUser(
			@PathVariable int userId,
			@RequestBody UserSuspendRequestDto request
	) {
		if (request == null || request.getReason() == null || request.getReason().trim().isEmpty()) {
			return ResponseEntity.badRequest().build();
		}

		return adminService.suspendUser(userId, request)
				? ResponseEntity.noContent().build()
				: ResponseEntity.notFound().build();
	}

	@PatchMapping("/user/{userId}/suspend/release")
	public ResponseEntity<Void> releaseUserBan(@PathVariable int userId) {
		return adminService.releaseUserBan(userId)
				? ResponseEntity.noContent().build()
				: ResponseEntity.notFound().build();
	}

	@PostMapping("/user/{userId}/withdraw")
	public ResponseEntity<Void> withdrawUser(
			@PathVariable int userId,
			@RequestBody(required = false) UserWithdrawRequestDto request
	) {
		return adminService.withdrawUser(userId)
				? ResponseEntity.noContent().build()
				: ResponseEntity.notFound().build();
	}
	
	@GetMapping("/report")
	public ResponseEntity<Map<String, Object>> getReports(ReportSearchDto dto){
		
		log.info("신고 목록 조회");
		
		dto.setOffset((dto.getPage() - 1) * dto.getSize());
		
		return ResponseEntity.ok(adminService.getReports(dto));
	}

	@GetMapping("/report/{reportId}")
	public ResponseEntity<ReportDetailDto> getReportDetail(@PathVariable long reportId) {
		
		System.out.println("reportId = " + reportId);
		ReportDetailDto detail = adminService.getReportDetail(reportId);
		System.out.println("detail = " + detail);

		return detail != null
				? ResponseEntity.ok(detail)
				: ResponseEntity.notFound().build();
	}

	@PatchMapping("/report/{reportId}/process")
	public ResponseEntity<Void> processReport(
			@PathVariable long reportId,
			@RequestBody ReportProcessRequestDto request
	) {
		if (request == null || request.getAction() == null || request.getAction().trim().isEmpty()) {
			return ResponseEntity.badRequest().build();
		}

		return adminService.processReport(reportId, request)
				? ResponseEntity.noContent().build()
				: ResponseEntity.notFound().build();
	}
	
	@GetMapping("/recipe")
	public ResponseEntity<Map<String, Object>> getRecipes(RecipeSearchDto dto){
		
		dto.setOffset((dto.getPage() - 1) * dto.getSize());
		
        return ResponseEntity.ok(adminService.getRecipes(dto));
	}

	@PatchMapping("/recipe/{recipeId}/hide")
	public ResponseEntity<Void> hideRecipe(@PathVariable int recipeId) {
		return adminService.hideRecipe(recipeId)
				? ResponseEntity.noContent().build()
				: ResponseEntity.notFound().build();
	}

	@PatchMapping("/recipe/{recipeId}/restore")
	public ResponseEntity<Void> restoreRecipe(@PathVariable int recipeId) {
		return adminService.restoreRecipe(recipeId)
				? ResponseEntity.noContent().build()
				: ResponseEntity.notFound().build();
	}
	
	@GetMapping("/notice")
	public ResponseEntity<Map<String, Object>> Notice(NoticeSearchDto condition){
		condition.setOffset((condition.getPage() - 1) * condition.getSize());
	    return ResponseEntity.ok(adminService.getNotices(condition));
	}

	@PostMapping("/notice")
	public ResponseEntity<Void> createNotice(@RequestBody NoticeDto notice) {
		return adminService.createNotice(notice)
				? ResponseEntity.noContent().build()
				: ResponseEntity.badRequest().build();
	}

	@PutMapping("/notice/{noticeId}")
	public ResponseEntity<Void> updateNotice(
			@PathVariable long noticeId,
			@RequestBody NoticeDto notice
	) {
		notice.setNoticeId(noticeId);
		return adminService.updateNotice(notice)
				? ResponseEntity.noContent().build()
				: ResponseEntity.notFound().build();
	}

	@PatchMapping("/notice/{noticeId}/delete")
	public ResponseEntity<Void> deleteNotice(@PathVariable long noticeId) {
		return adminService.deleteNotice(noticeId)
				? ResponseEntity.noContent().build()
				: ResponseEntity.notFound().build();
	}
	
	@GetMapping("/inquiry")
	public ResponseEntity<Map<String, Object>> Inquiry(InquirySearchDto condition){
		condition.setOffset((condition.getPage() - 1) * condition.getSize());
        return ResponseEntity.ok(adminService.getInquiries(condition));
	}

	@PatchMapping("/inquiry/{inquiryId}/answer")
	public ResponseEntity<Void> answerInquiry(@PathVariable long inquiryId, @RequestBody InquiryAnswerDto request) {
		if (request == null || request.getAnswer() == null || request.getAnswer().trim().isEmpty()) {
			return ResponseEntity.badRequest().build();
		}
		
		request.setInquiryId(inquiryId);
		return adminService.answerInquiry(request)
				? ResponseEntity.noContent().build()
				: ResponseEntity.notFound().build();
	}
	
}
