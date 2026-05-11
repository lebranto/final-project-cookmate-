package com.kh.cookmate.member.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.kh.cookmate.member.dto.InquiryDto;
import com.kh.cookmate.member.dto.MemberDto;
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
     
    @GetMapping("/ranking")
    public ResponseEntity<List<MemberDto>> getChefRanking(
        @RequestParam(value="filter", defaultValue="recipe") String filter) {
        
        List<MemberDto> list = memberService.selectChefRanking(filter);
        return ResponseEntity.ok(list);
    }
    
    /**
     * 1. 마이페이지 상단 통계 조회 (레시피, 스크랩, 문의 개수)
     */
    @GetMapping("/stats")
    public ResponseEntity<MemberDto> getMemberStats(@RequestParam long userNo) {
        log.info("마이페이지 통계 조회 - 유저번호: {}", userNo);
        return ResponseEntity.ok(memberService.getMemberStats(userNo));
    }

    /**
     * 2. 내가 만든 레시피 목록 조회
     */
    @GetMapping("/recipes")
    public ResponseEntity<List<RecipeDto>> getMyRecipes(
            @RequestParam long userNo,
            @RequestParam(required = false, defaultValue = "전체") String category) {
        
        Map<String, Object> params = new HashMap<>();
        params.put("userNo", userNo);
        params.put("category", category);
        
        return ResponseEntity.ok(memberService.selectMyRecipes(params));
    }

    /**
     * 3. 스크랩한 레시피 목록 조회
     */
    @GetMapping("/scraps")
    public ResponseEntity<List<RecipeDto>> getMyScraps(
            @RequestParam long userNo,
            @RequestParam(required = false, defaultValue = "전체") String category) {
        
        Map<String, Object> params = new HashMap<>();
        params.put("userNo", userNo);
        params.put("category", category);
        
        return ResponseEntity.ok(memberService.selectMyScraps(params));
    }

    /**
     * 4. 문의 내역 목록 조회
     */
    @GetMapping("/inquiries")
    public ResponseEntity<List<InquiryDto>> getMyInquiries(@RequestParam long userNo) {
        return ResponseEntity.ok(memberService.selectMyInquiries(userNo));
    }
    
    /**
     * 4-1. 문의 상세 조회 (user_inquiry_view_pc.html 용)
     */
    @GetMapping("/inquiries/{inquiryNo}")
    public ResponseEntity<InquiryDto> getInquiryDetail(@PathVariable("inquiryNo") long inquiryNo) {
        log.info("문의 상세 조회 - 번호: {}", inquiryNo);
        InquiryDto inquiry = memberService.selectInquiryDetail(inquiryNo);
        
        return inquiry != null ? ResponseEntity.ok(inquiry) : ResponseEntity.notFound().build();
    }

    /**
     * 4-2. 문의 등록 (user_inquiry_write_pc.html 용)
     */
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

    /**
     * 4-3. 문의 삭제 (상세 보기 페이지 내 삭제 버튼 용)
     */
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
    
    /**
     * 5. 회원 정보 수정 (닉네임, 소개글, 알레르기)
     */
    @PatchMapping("/profile")
    public ResponseEntity<String> updateProfile(@RequestBody MemberDto memberDto) {
        log.info("회원 정보 수정 요청: {}", memberDto);
        int result = memberService.updateProfile(memberDto);
        
        if (result > 0) {
            return ResponseEntity.ok("회원 정보가 수정되었습니다.");
        } else {
            return ResponseEntity.badRequest().body("수정에 실패했습니다.");
        }
    }

    /**
     * 6. 회원 탈퇴 (소프트 딜리트)
     */
    @PostMapping("/withdraw")
    public ResponseEntity<String> withdrawMember(@RequestParam long userNo) {
        log.info("회원 탈퇴 요청 - 유저번호: {}", userNo);
        int result = memberService.withdrawMember(userNo);
        
        if (result > 0) {
            return ResponseEntity.ok("탈퇴 처리가 완료되었습니다.");
        } else {
            return ResponseEntity.badRequest().body("탈퇴 처리에 실패했습니다.");
        }
    }
}