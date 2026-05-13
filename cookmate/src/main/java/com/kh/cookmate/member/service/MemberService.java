package com.kh.cookmate.member.service;

import java.util.List;
import java.util.Map;

import com.kh.cookmate.member.dto.InquiryDto;
import com.kh.cookmate.member.dto.MemberDto;
import com.kh.cookmate.member.dto.MemberUpdateDto;
import com.kh.cookmate.member.dto.RecipeDto;

public interface MemberService {
    
    // --- 1. 회원 정보 조회 및 보안 ---
    MemberDto selectUserByNo(long userNo);               // 기본 정보 조회
    MemberDto getMemberStats(long userNo);               // 마이페이지 통계 조회
    List<String> selectUserAllergies(long userNo);       // 알레르기 목록 조회
    boolean verifyPassword(long userNo, String password); // 비밀번호 일치 확인 (BCrypt)

    // --- 2. 회원 정보 수정 및 관리 ---
    void updateProfile(MemberUpdateDto updateDto);       // 프로필 + 알레르기 + 비밀번호 통합 수정
    int withdrawMember(long userNo);                     // 회원 탈퇴

    // --- 3. 마이페이지 목록 조회 ---
    List<RecipeDto> selectMyRecipes(Map<String, Object> params);
    List<RecipeDto> selectMyScraps(Map<String, Object> params);
    List<InquiryDto> selectMyInquiries(long userNo);

    // --- 4. 1:1 문의 관리 (CRUD) ---
    InquiryDto selectInquiryDetail(long inquiryNo);
    int insertInquiry(InquiryDto inquiryDto);
    int updateInquiry(InquiryDto inquiryDto);
    int deleteInquiry(long inquiryNo);

    // --- 5. 셰프 리스트 및 소셜 기능 ---
    List<MemberDto> getChefRanking(String filter, Long loginUserNo);
    MemberDto getChefDetail(long chefNo, Long loginUserNo);
    List<Map<String, Object>> getChefRecipeComments(long chefNo);
    boolean toggleFollow(long loginUserNo, String targetEmail); // 팔로우/언팔로우 토글
}