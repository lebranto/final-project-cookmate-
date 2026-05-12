package com.kh.cookmate.member.dao;

import java.util.List;
import java.util.Map;

import org.mybatis.spring.SqlSessionTemplate;
import org.springframework.stereotype.Repository;

import com.kh.cookmate.member.dto.InquiryDto;
import com.kh.cookmate.member.dto.MemberDto;
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
    public int updateMember(MemberDto memberDto) {
        return session.update("member.updateMember", memberDto);
    }

    @Override
    public int deleteUserAllergies(long userNo) {
        return session.delete("member.deleteUserAllergies", userNo);
    }

    @Override
    public int insertUserAllergy(Map<String, Object> params) {
        return session.insert("member.insertUserAllergy", params);
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
    public void insertFollow(Map<String, Object> params) {
        session.insert("member.insertFollow", params);
    }

    @Override
    public void deleteFollow(Map<String, Object> params) {
        session.delete("member.deleteFollow", params);
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
}