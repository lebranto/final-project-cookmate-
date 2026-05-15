package com.kh.cookmate.member.dao;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.mybatis.spring.SqlSessionTemplate;
import org.springframework.stereotype.Repository;

import com.kh.cookmate.member.dto.FollowDto;
import com.kh.cookmate.member.dto.InquiryDto;
import com.kh.cookmate.member.dto.MemberDto;
import com.kh.cookmate.member.dto.MemberUpdateDto;
import com.kh.cookmate.member.dto.MyCommentDto;
import com.kh.cookmate.member.dto.RecipeDto;
import com.kh.cookmate.member.vo.Member;

import lombok.RequiredArgsConstructor;

@Repository
@RequiredArgsConstructor
public class MemberDaoImpl implements MemberDao {

    private final SqlSessionTemplate session;

    @Override
    public Member selectUserByNo(long userNo) {
        return session.selectOne("member.selectUserByNo", userNo);
    }

    @Override
    public MemberDto getMemberStats(long userNo) {
        return session.selectOne("member.getMemberStats", userNo);
    }

    @Override
    public List<RecipeDto> selectMyRecipes(Map<String, Object> params) {
        return session.selectList("member.selectMyRecipes", params);
    }

    @Override
    public List<RecipeDto> selectMyScraps(Map<String, Object> params) {
        return session.selectList("member.selectMyScraps", params);
    }

    @Override
    public List<InquiryDto> selectMyInquiries(long userNo) {
        return session.selectList("member.selectMyInquiries", userNo);
    }

    @Override
    public int withdrawMember(long userNo) {
        return session.update("member.withdrawMember", userNo);
    }
    
    @Override
    public InquiryDto selectInquiryDetail(long inquiryNo) {
        return session.selectOne("member.selectInquiryDetail", inquiryNo);
    }

    @Override
    public int insertInquiry(InquiryDto inquiryDto) {
        return session.insert("member.insertInquiry", inquiryDto);
    }

    @Override
    public int deleteInquiry(long inquiryNo) {
        return session.delete("member.deleteInquiry", inquiryNo);
    }

	@Override
	public List<MemberDto> selectChefRanking(Map<String, Object> params) {
		return session.selectList("member.selectChefRanking", params);
	}

	@Override
    public MemberDto selectChefDetail(Map<String, Object> params) {
        return session.selectOne("member.selectChefDetail", params);
    }

    @Override
    public int checkFollow(Map<String, Object> params) {
        return session.selectOne("member.checkFollow", params);
    }

    @Override
    public int insertFollow(Map<String, Object> params) {
        return session.insert("member.insertFollow", params);
    }

    @Override
    public int deleteFollow(Map<String, Object> params) {
        return session.delete("member.deleteFollow", params);
    }
    
    @Override
    public List<Map<String, Object>> selectChefRecipeComments(long chefNo) {
        return session.selectList("member.selectChefRecipeComments", chefNo);
    }
    
    @Override
    public int updateInquiry(InquiryDto inquiryDto) {
        return session.update("member.updateInquiry", inquiryDto);
    }

	@Override
	public List<String> selectUserAllergies(long userNo) {
		return session.selectList("member.selectUserAllergies", userNo);
	}
	
	@Override
    public String selectPassword(long userNo) {
        return session.selectOne("member.selectPassword", userNo);
    }

	@Override
	public int updateMemberProfile(MemberUpdateDto updateDto) {
	    return session.update("member.updateMemberProfile", updateDto);
	}

	@Override
	public void updateMemberPassword(long userNo, String encodedPw) {
	    Map<String, Object> map = new HashMap<>();
	    map.put("userNo", userNo);
	    map.put("encodedPw", encodedPw);
	    
	    session.update("member.updateMemberPassword", map);
	}

	@Override
	public void deleteMemberAllergies(long userNo) {
	    session.delete("member.deleteMemberAllergies", userNo);
	}

	@Override
	public void insertMemberAllergy(long userNo, String allergyName) {
	    Map<String, Object> map = new HashMap<>();
	    map.put("userNo", userNo);
	    map.put("allergyName", allergyName);
	    
	    session.insert("member.insertMemberAllergy", map);
	}

	@Override
	public List<FollowDto> selectFollowingList(Map<String, Object> params) {
		return session.selectList("member.selectFollowingList",params);
	}

	@Override
	public List<FollowDto> selectFollowerList(Map<String, Object> params) {
		return session.selectList("member.selectFollowerList",params);
	}

	@Override
	public List<MyCommentDto> selectMyWrittenComments(Map<String, Object> params) {
		return session.selectList("member.selectMyWrittenComments",params);
	}

	@Override
	public List<MyCommentDto> selectCommentsOnMyBoards(Map<String, Object> params) {
		return session.selectList("member.selectCommentsOnMyBoards",params);
	}

	@Override
	public String getKakaoAccessToken(long userNo) {
		return session.selectOne("member.getKakaoAccessToken",userNo);
	}

	@Override
	public int deleteUserIdentity(long userNo) {
		return session.delete("member.deleteUserIdentity",userNo);
	}

	@Override
	public int deleteUserAuthorities(long userNo) {
		return session.delete("member.deleteUserAuthorities",userNo);
	}

	@Override
	public int deleteUserCredentials(long userNo) {
		return session.delete("member.deleteUserCredentials",userNo);
	}

	@Override
	public int deleteAllScraps(long userNo) {
		return session.delete("member.deleteAllScraps",userNo);
	}

	@Override
	public int deleteAllFollowing(Map<String, Object> followParams) {
		return session.delete("member.deleteAllFollowing",followParams);
	}
}