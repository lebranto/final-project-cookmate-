package com.kh.cookmate.member.service;

import java.util.List;
import java.util.Map;

import com.kh.cookmate.member.dto.FollowDto;
import com.kh.cookmate.member.dto.InquiryDto;
import com.kh.cookmate.member.dto.MemberDto;
import com.kh.cookmate.member.dto.MemberUpdateDto;
import com.kh.cookmate.member.dto.MyCommentDto;
import com.kh.cookmate.member.dto.RecipeDto;

public interface MemberService {
    
    MemberDto selectUserByNo(long userNo);    
    
    MemberDto getMemberStats(long userNo);          
    
    List<String> selectUserAllergies(long userNo);     
    
    boolean verifyPassword(long userNo, String password); 

    void updateProfile(MemberUpdateDto updateDto);    
    
    int withdrawMember(long userNo);                    

    List<RecipeDto> selectMyRecipes(Map<String, Object> params);
    
    List<RecipeDto> selectMyScraps(Map<String, Object> params);
    
    List<InquiryDto> selectMyInquiries(long userNo);

    InquiryDto selectInquiryDetail(long inquiryNo);
    
    int insertInquiry(InquiryDto inquiryDto);
    
    int updateInquiry(InquiryDto inquiryDto);
    
    int deleteInquiry(long inquiryNo);

    List<MemberDto> getChefRanking(String filter, Long loginUserNo);
    
    MemberDto getChefDetail(long chefNo, Long loginUserNo);
    
    List<Map<String, Object>> getChefRecipeComments(long chefNo);
    
    boolean toggleFollow(long loginUserNo, String targetEmail); 
    
	String withdrawKakaoUser(long userNo, String accessToken);

	Map<String, List<FollowDto>> getFollowList(long userNo, String filter);

	Map<String, List<MyCommentDto>> getCommentList(long userNo, String filter);

	List<RecipeDto> selectChefRecipes(Map<String, Object> params);
}