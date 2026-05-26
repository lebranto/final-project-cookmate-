package com.kh.cookmate.member.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.kh.cookmate.member.dto.FollowDto;
import com.kh.cookmate.member.dto.InquiryDto;
import com.kh.cookmate.member.dto.MemberDto;
import com.kh.cookmate.member.dto.MemberUpdateDto;
import com.kh.cookmate.member.dto.MyCommentDto;
import com.kh.cookmate.member.dto.RecipeDto;
import com.kh.cookmate.member.service.MemberService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/users")
public class MemberController {

    private final MemberService memberService;
    
    //마이페이지 유저 정보 가져오기
    @GetMapping("/mypage/{userNo}")
    public ResponseEntity<MemberDto> getMyPageInfo(@PathVariable("userNo") long userNo) {
        MemberDto user = memberService.selectUserByNo(userNo);
        
        if (user != null) {
            return ResponseEntity.ok(user);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
     
    //셰프리스트
    @GetMapping("/chef")
    public ResponseEntity<List<MemberDto>> getChefRanking(
            @RequestParam(defaultValue = "recipe") String filter,
            @RequestParam(required = false) Long loginUserNo) {
        return ResponseEntity.ok(memberService.getChefRanking(filter, loginUserNo));
    }
    
    //셰프 상세보기
    @GetMapping("/chef/{chefNo}")
    public ResponseEntity<MemberDto> getChefDetail(
            @PathVariable long chefNo,
            @RequestParam(required = false) Long loginUserNo) {
        return ResponseEntity.ok(memberService.getChefDetail(chefNo, loginUserNo));
    }
    
    //셰프 상세보기 - 댓글
    @GetMapping("/chef/{chefNo}/recipe-comments")
    public ResponseEntity<List<Map<String, Object>>> getChefRecipeComments(@PathVariable long chefNo) {
        log.info("셰프 댓글 목록 조회 - 셰프번호: {}", chefNo);
        return ResponseEntity.ok(memberService.getChefRecipeComments(chefNo));
    }

    //팔로우
    @PostMapping("/follow")
    public ResponseEntity<?> toggleFollow(
            @RequestParam long loginUserNo,
            @RequestParam String targetEmail) {
        
        try {
            boolean isFollowing = memberService.toggleFollow(loginUserNo, targetEmail);
            return ResponseEntity.ok(isFollowing);
            
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @GetMapping("/follow/list")
    public ResponseEntity<Map<String, List<FollowDto>>> getFollowList(
            @RequestParam long userNo,
            @RequestParam(defaultValue = "newest") String filter) {
        
        Map<String, List<FollowDto>> followData = memberService.getFollowList(userNo, filter);
        
        return ResponseEntity.ok(followData);
    }
    
    //마이페이지 상단 통계 조회 (레시피, 스크랩, 문의 개수)
    @GetMapping("/stats")
    public ResponseEntity<MemberDto> getMemberStats(@RequestParam long userNo) {
        log.info("마이페이지 통계 조회 - 유저번호: {}", userNo);
        return ResponseEntity.ok(memberService.getMemberStats(userNo));
    }

    //내가 만든 레시피 목록 조회
    @GetMapping("/recipes")
    public ResponseEntity<List<RecipeDto>> getMyRecipes(
            @RequestParam long userNo,
            @RequestParam(required = false, defaultValue = "전체") String category) {
        
        Map<String, Object> params = new HashMap<>();
        params.put("userNo", userNo);
        params.put("category", category);
        
        return ResponseEntity.ok(memberService.selectMyRecipes(params));
    }

    //스크랩한 레시피 목록 조회
    @GetMapping("/scraps")
    public ResponseEntity<List<RecipeDto>> getMyScraps(
            @RequestParam long userNo,
            @RequestParam(required = false, defaultValue = "전체") String category) {
        
        Map<String, Object> params = new HashMap<>();
        params.put("userNo", userNo);
        params.put("category", category);
        
        return ResponseEntity.ok(memberService.selectMyScraps(params));
    }

    //문의 내역 목록 조회
    @GetMapping("/inquiries")
    public ResponseEntity<List<InquiryDto>> getMyInquiries(@RequestParam long userNo) {
        return ResponseEntity.ok(memberService.selectMyInquiries(userNo));
    }
    
    //문의 상세 조회
    @GetMapping("/inquiries/{inquiryNo}")
    public ResponseEntity<InquiryDto> getInquiryDetail(@PathVariable("inquiryNo") long inquiryNo) {
        log.info("문의 상세 조회 - 번호: {}", inquiryNo);
        InquiryDto inquiry = memberService.selectInquiryDetail(inquiryNo);
        
        return inquiry != null ? ResponseEntity.ok(inquiry) : ResponseEntity.notFound().build();
    }

    //문의 수정
    @PutMapping("/inquiries/{inquiryNo}")
    public ResponseEntity<String> updateInquiry(@PathVariable long inquiryNo, @RequestBody InquiryDto inquiryDto) {
    	
    	inquiryDto.setInquiryNo(inquiryNo);
    	
    	int result = memberService.updateInquiry(inquiryDto);
    	
    	if(result > 0) {
    		return ResponseEntity.ok("문의 수정 성공");
    	} else {
    		return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("문의 수정 실패");
    	}
    }
    
    //문의 등록 
    @PostMapping("/inquiries")
    public ResponseEntity<String> insertInquiry(@RequestBody InquiryDto inquiryDto) {
        log.info("문의 등록 요청: {}", inquiryDto);
        int result = memberService.insertInquiry(inquiryDto);
        
        if (result > 0) {
            return ResponseEntity.ok("문의가 성공적으로 등록되었습니다.");
        } else {
            return ResponseEntity.badRequest().body("문의 등록에 실패했습니다.");
        }
    }

    //문의 삭제 (상세 보기 페이지 내 삭제 버튼 용)
    @DeleteMapping("/inquiries/{inquiryNo}")
    public ResponseEntity<String> deleteInquiry(@PathVariable("inquiryNo") long inquiryNo) {
        log.info("문의 삭제 요청 - 번호: {}", inquiryNo);
        int result = memberService.deleteInquiry(inquiryNo);
        
        if (result > 0) {
            return ResponseEntity.ok("문의가 삭제되었습니다.");
        } else {
            return ResponseEntity.badRequest().body("삭제 처리에 실패했습니다.");
        }
    }
    
    //회원 탈퇴 (소프트 딜리트)
    @PostMapping("/withdraw/{userNo}")
    public ResponseEntity<String> withdrawMember(@PathVariable long userNo) { 
        log.info("일반 회원 탈퇴 요청 - 유저번호: {}", userNo);
        
        int result = memberService.withdrawMember(userNo);
        
        if (result > 0) {
        	ResponseCookie deleteCookie = ResponseCookie.from("refreshToken", "") 
                    .maxAge(0)    
                    .path("/")     
                    // .secure(true)    // HTTPS 환경일때 주석해제
                    .httpOnly(true)  
                    .build();
            return ResponseEntity.ok()
            		.header(HttpHeaders.SET_COOKIE, deleteCookie.toString())
            		.body("탈퇴 처리가 완료되었습니다.");
        } else {
            return ResponseEntity.badRequest().body("탈퇴 처리에 실패했습니다.");
        }
    }
    
    @GetMapping("/profile/{userNo}")
    public ResponseEntity<Map<String, Object>> getProfileDetail(@PathVariable long userNo) {
        log.info("프로필 조회 요청 - 유저번호: {}", userNo);
        
        MemberDto member = memberService.selectUserByNo(userNo); 
        List<String> allergies = memberService.selectUserAllergies(userNo);
        
        if (member == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        Map<String, Object> response = new HashMap<>();
        response.put("userNo", member.getUserNo());
        response.put("userEmail", member.getUserEmail());
        response.put("nickname", member.getNickname());
        response.put("introduce", member.getIntroduce());
        response.put("address", member.getAddress());
        response.put("profileImageUrl", member.getProfileImageUrl());
        response.put("allergies", allergies);
        response.put("provider", member.getProvider());
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/comments/list")
    public ResponseEntity<Map<String, List<MyCommentDto>>> getMyCommentList(
            @RequestParam long userNo,
            @RequestParam(defaultValue = "newest") String filter) {
        
        // 서비스 호출하여 데이터 가져오기
        Map<String, List<MyCommentDto>> commentData = memberService.getCommentList(userNo, filter);
        
        return ResponseEntity.ok(commentData);
    }
    
    // 회원 정보 통합 수정 (프로필 + 비밀번호 + 알레르기)
    @PostMapping("/profile/update")
    public ResponseEntity<String> updateProfile(@RequestBody MemberUpdateDto updateDto) {
        log.info("회원 통합 수정 요청: {}", updateDto);
        
        try {
            memberService.updateProfile(updateDto);
            return ResponseEntity.ok("회원 정보가 성공적으로 수정되었습니다.");
        } catch (Exception e) {
            log.error("프로필 수정 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                 .body("수정 중 오류가 발생했습니다.");
        }
    }
    
    //3. 현재 비밀번호 확인
    @PostMapping("/profile/verify-password")
    public ResponseEntity<Map<String, Boolean>> verifyPassword(@RequestBody Map<String, Object> payload) {
        Object userNoObj = payload.get("userNo");
        String password = (String) payload.get("password");

        if (userNoObj == null || password == null) {
            return ResponseEntity.badRequest().build();
        }

        long userNo = Long.parseLong(userNoObj.toString());
        log.info("비밀번호 검증 요청 - 유저번호: {}", userNo);

        boolean isValid = memberService.verifyPassword(userNo, password);

        Map<String, Boolean> response = new HashMap<>();
        response.put("isValid", isValid);

        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/withdraw/kakao/{userNo}")
    public ResponseEntity<String> withdrawKakao(
            @PathVariable long userNo, 
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("토큰이 존재하지 않거나 형식이 잘못되었습니다.");
        }

        String accessToken = authHeader.substring(7);

        String result = memberService.withdrawKakaoUser(userNo, accessToken);

        if ("SUCCESS".equals(result)) {
        	ResponseCookie deleteCookie = ResponseCookie.from("refreshToken", "") 
                    .maxAge(0)    
                    .path("/")     
                    // .secure(true)    // HTTPS 환경일때 주석해제
                    .httpOnly(true)  
                    .build();
            return ResponseEntity.ok()
            		.header(HttpHeaders.SET_COOKIE, deleteCookie.toString())
            		.body("탈퇴 처리가 완료되었습니다.");
        } else if ("TOKEN_EXPIRED".equals(result)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("TOKEN_EXPIRED");
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("탈퇴 처리에 실패했습니다.");
        }
    }
}