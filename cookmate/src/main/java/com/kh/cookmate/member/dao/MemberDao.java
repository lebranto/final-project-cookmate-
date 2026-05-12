package com.kh.cookmate.member.dao;

import java.util.List;
import java.util.Map;

import com.kh.cookmate.member.dto.InquiryDto;
import com.kh.cookmate.member.dto.MemberDto;
import com.kh.cookmate.member.dto.RecipeDto;
import com.kh.cookmate.member.vo.Member;

public interface MemberDao {
	
    Member selectUserByNo(long userNo);

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
	
	List<MemberDto> selectChefRanking(Map<String, Object> params);
	
    MemberDto selectChefDetail(Map<String, Object> params);
    
    int checkFollow(Map<String, Object> params);
    
    void insertFollow(Map<String, Object> params);
    
    void deleteFollow(Map<String, Object> params);

	List<Map<String, Object>> selectChefRecipeComments(long chefNo);

	int updateInquiry(InquiryDto inquiryDto);

	List<String> selectUserAllergies(long userNo);

	String selectPassword(long userNo);
}