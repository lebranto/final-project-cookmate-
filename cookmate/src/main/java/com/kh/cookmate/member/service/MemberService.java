package com.kh.cookmate.member.service;

import java.util.List;
import java.util.Map;

import com.kh.cookmate.member.dto.InquiryDto;
import com.kh.cookmate.member.dto.MemberDto;
import com.kh.cookmate.member.dto.RecipeDto;

public interface MemberService {
    
    // 마이페이지: 유저 기본 정보 조회 (VO -> DTO 변환)
    MemberDto selectUserByNo(long userNo);

    // 셰프 리스트: 필터에 따른 랭킹 조회 (List<VO> -> List<DTO> 변환)
    List<MemberDto> selectChefRanking(String filter);

    List<InquiryDto> selectMyInquiries(long userNo);

	List<RecipeDto> selectMyScraps(Map<String, Object> params);

	List<RecipeDto> selectMyRecipes(Map<String, Object> params);

	MemberDto getMemberStats(long userNo);

	int updateProfile(MemberDto memberDto);

	int withdrawMember(long userNo);

	InquiryDto selectInquiryDetail(long inquiryNo);

	int insertInquiry(InquiryDto inquiryDto);

	int deleteInquiry(long inquiryNo);
}