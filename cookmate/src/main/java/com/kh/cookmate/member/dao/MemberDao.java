package com.kh.cookmate.member.dao;

import java.util.List;
import java.util.Map;

import com.kh.cookmate.member.dto.InquiryDto;
import com.kh.cookmate.member.dto.MemberDto;
import com.kh.cookmate.member.dto.RecipeDto;
import com.kh.cookmate.member.vo.Member;

public interface MemberDao {
    // 1. 마이페이지 유저 정보 조회
    Member selectUserByNo(long userNo);

    // 2. 셰프 랭킹 조회
    List<Member> selectChefRanking(String filter);

	MemberDto getMemberStats(long userNo);

	List<RecipeDto> selectMyRecipes(Map<String, Object> params);

	List<RecipeDto> selectMyScraps(Map<String, Object> params);

	List<InquiryDto> selectMyInquiries(long userNo);

	int updateMember(MemberDto memberDto);

	int deleteUserAllergies(long userNo);

	int insertUserAllergy(Map<String, Object> map);

	int withdrawMember(long userNo);

	InquiryDto selectInquiryDetail(long inquiryNo);

	int insertInquiry(InquiryDto inquiryDto);

	int deleteInquiry(long inquiryNo);
}