package com.kh.cookmate.member.dao;

import java.util.List;
import java.util.Map;

import com.kh.cookmate.member.dto.FollowDto;
import com.kh.cookmate.member.dto.InquiryDto;
import com.kh.cookmate.member.dto.MemberDto;
import com.kh.cookmate.member.dto.MemberUpdateDto;
import com.kh.cookmate.member.dto.MyCommentDto;
import com.kh.cookmate.member.dto.RecipeDto;
import com.kh.cookmate.member.vo.Member;

public interface MemberDao {
    
    Member selectUserByNo(long userNo);          

    MemberDto getMemberStats(long userNo);            
    
    List<String> selectUserAllergies(long userNo);       
    
    String selectPassword(long userNo);                  

    int updateMemberProfile(MemberUpdateDto updateDto);  

    void updateMemberPassword(long userNo, String encodedPw);

    void deleteMemberAllergies(long userNo);            

    void insertMemberAllergy(long userNo, String allergyName); 

    int withdrawMember(long userNo);

    List<RecipeDto> selectMyRecipes(Map<String, Object> params);
    
    List<RecipeDto> selectMyScraps(Map<String, Object> params);
    
    List<InquiryDto> selectMyInquiries(long userNo);

    InquiryDto selectInquiryDetail(long inquiryNo);
    
    int insertInquiry(InquiryDto inquiryDto);
    
    int updateInquiry(InquiryDto inquiryDto);
    
    int deleteInquiry(long inquiryNo);
    
    List<MemberDto> selectChefRanking(Map<String, Object> params);
    
    MemberDto selectChefDetail(Map<String, Object> params);
    
    List<Map<String, Object>> selectChefRecipeComments(long chefNo);
    
    int checkFollow(Map<String, Object> params);
    
    int insertFollow(Map<String, Object> params);
    
    int deleteFollow(Map<String, Object> params);

	List<FollowDto> selectFollowingList(Map<String, Object> params);

	List<FollowDto> selectFollowerList(Map<String, Object> params);

	List<MyCommentDto> selectMyWrittenComments(Map<String, Object> params);

	List<MyCommentDto> selectCommentsOnMyBoards(Map<String, Object> params);

	String getKakaoAccessToken(long userNo);

	int deleteUserIdentity(long userNo);

	int deleteUserAuthorities(long userNo);

	int deleteUserCredentials(long userNo);

	int deleteAllScraps(long userNo);

	int deleteAllFollowing(Map<String, Object> followParams);

	List<RecipeDto> selectChefRecipes(Map<String, Object> params);
}