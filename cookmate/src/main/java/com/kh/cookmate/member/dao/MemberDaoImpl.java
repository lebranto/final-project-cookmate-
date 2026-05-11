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
    public List<Member> selectChefRanking(String filter) {
        return session.selectList("member.selectChefRanking", filter);
    }
    
    @Override
    public MemberDto getMemberStats(long userNo) {
        // user-mapper.xml의 <select id="getMemberStats"> 호출
        return session.selectOne("member.getMemberStats", userNo);
    }

    @Override
    public List<RecipeDto> selectMyRecipes(Map<String, Object> params) {
        // BOARD 테이블의 데이터를 RecipeDto 리스트로 반환
        return session.selectList("member.selectMyRecipes", params);
    }

    @Override
    public List<RecipeDto> selectMyScraps(Map<String, Object> params) {
        // SCRAP과 BOARD를 조인한 결과를 반환
        return session.selectList("member.selectMyScraps", params);
    }

    @Override
    public List<InquiryDto> selectMyInquiries(long userNo) {
        // INQUIRY 테이블에서 특정 유저의 문의 내역 조회
        return session.selectList("member.selectMyInquiries", userNo);
    }

    @Override
    public int updateMember(MemberDto memberDto) {
        // USER 테이블의 닉네임, 소개글 등 수정
        return session.update("member.updateMember", memberDto);
    }

    @Override
    public int deleteUserAllergies(long userNo) {
        // 수정 시 기존 알레르기 정보를 초기화
        return session.delete("member.deleteUserAllergies", userNo);
    }

    @Override
    public int insertUserAllergy(Map<String, Object> params) {
        // 선택된 알레르기 정보를 새로 삽입
        return session.insert("member.insertUserAllergy", params);
    }

    @Override
    public int withdrawMember(long userNo) {
        // WITHDRAW 컬럼을 'Y'로 변경하여 소프트 딜리트 수행
        return session.update("member.withdrawMember", userNo);
    }
    
    @Override
    public InquiryDto selectInquiryDetail(long inquiryNo) {
        // namespace "user"의 selectInquiryDetail 쿼리 실행
        return session.selectOne("member.selectInquiryDetail", inquiryNo);
    }

    @Override
    public int insertInquiry(InquiryDto inquiryDto) {
        // 새로운 문의 데이터를 INQUIRY 테이블에 삽입
        return session.insert("member.insertInquiry", inquiryDto);
    }

    @Override
    public int deleteInquiry(long inquiryNo) {
        // 특정 문의 번호에 해당하는 행을 삭제 또는 상태 변경
        return session.delete("member.deleteInquiry", inquiryNo);
    }
}