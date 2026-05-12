package com.kh.cookmate.member.service;

import java.util.List;
import java.util.Map;

import com.kh.cookmate.member.dto.InquiryDto;
import com.kh.cookmate.member.dto.MemberDto;
import com.kh.cookmate.member.dto.RecipeDto;

public interface MemberService {
    
    MemberDto selectUserByNo(long userNo);

    List<MemberDto> getChefRanking(String filter, Long loginUserNo);
    
    MemberDto getChefDetail(long chefNo, Long loginUserNo);
    
    boolean toggleFollow(long loginUserNo, String targetEmail);
    
    List<InquiryDto> selectMyInquiries(long userNo);

	List<RecipeDto> selectMyScraps(Map<String, Object> params);

	List<RecipeDto> selectMyRecipes(Map<String, Object> params);

	MemberDto getMemberStats(long userNo);

	int updateProfile(MemberDto memberDto);

	int withdrawMember(long userNo);

	InquiryDto selectInquiryDetail(long inquiryNo);

	int insertInquiry(InquiryDto inquiryDto);

	int deleteInquiry(long inquiryNo);

	List<Map<String, Object>> getChefRecipeComments(long chefNo);

	int updateInquiry(InquiryDto inquiryDto);

	void updateProfileWithAllergies(Map<String, Object> payload);

	List<String> selectUserAllergies(long userNo);

	boolean verifyPassword(long userNo, String password);
}