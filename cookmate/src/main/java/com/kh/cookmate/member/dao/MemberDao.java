package com.kh.cookmate.member.dao;

import java.util.List;
import java.util.Map;

import com.kh.cookmate.member.dto.InquiryDto;
import com.kh.cookmate.member.dto.MemberDto;
import com.kh.cookmate.member.dto.MemberUpdateDto;
import com.kh.cookmate.member.dto.RecipeDto;
import com.kh.cookmate.member.vo.Member;

public interface MemberDao {
    
    // --- 1. 회원 정보 조회 관련 ---
    Member selectUserByNo(long userNo);                  // 유저 기본 정보(VO)
    MemberDto getMemberStats(long userNo);               // 마이페이지 통계 (레시피/스크랩/문의 수)
    List<String> selectUserAllergies(long userNo);       // 알레르기 목록만 조회
    String selectPassword(long userNo);                  // 암호화된 비밀번호 조회 (검증용)

    // --- 2. 회원 정보 수정 (통합 로직) ---
    // 기존 updateMember(MemberDto) 대신 통합 DTO를 사용하는 아래 메서드로 단일화합니다.
    int updateMemberProfile(MemberUpdateDto updateDto);  // 닉네임, 소개글, 프로필사진 수정
    void updateMemberPassword(long userNo, String encodedPw); // 비밀번호 수정
    void deleteMemberAllergies(long userNo);             // 알레르기 일괄 삭제
    void insertMemberAllergy(long userNo, String allergyName); // 알레르기 개별 삽입

    // --- 3. 회원 탈퇴 ---
    int withdrawMember(long userNo);

    // --- 4. 마이페이지 목록 조회 ---
    List<RecipeDto> selectMyRecipes(Map<String, Object> params);
    List<RecipeDto> selectMyScraps(Map<String, Object> params);
    List<InquiryDto> selectMyInquiries(long userNo);

    // --- 5. 1:1 문의 관리 (CRUD) ---
    InquiryDto selectInquiryDetail(long inquiryNo);
    int insertInquiry(InquiryDto inquiryDto);
    int updateInquiry(InquiryDto inquiryDto);
    int deleteInquiry(long inquiryNo);
    
    // --- 6. 셰프 및 랭킹 관련 ---
    List<MemberDto> selectChefRanking(Map<String, Object> params);
    MemberDto selectChefDetail(Map<String, Object> params);
    List<Map<String, Object>> selectChefRecipeComments(long chefNo);
    
    // --- 7. 팔로우 관련 ---
    int checkFollow(Map<String, Object> params);
    void insertFollow(Map<String, Object> params);
    void deleteFollow(Map<String, Object> params);
}