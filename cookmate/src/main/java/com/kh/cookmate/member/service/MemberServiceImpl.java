package com.kh.cookmate.member.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.kh.cookmate.member.dao.MemberDao;
import com.kh.cookmate.member.dto.InquiryDto;
import com.kh.cookmate.member.dto.MemberDto;
import com.kh.cookmate.member.dto.RecipeDto;
import com.kh.cookmate.member.vo.Member;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MemberServiceImpl implements MemberService {

    private final MemberDao memberDao; // DAO 주입

    @Override
    public MemberDto selectUserByNo(long userNo) {
        Member member = memberDao.selectUserByNo(userNo);
        // DB에서 가져온 VO를 안전한 DTO로 변환해서 반환
        return MemberDto.fromEntity(member);
    }

    @Override
    public List<MemberDto> selectChefRanking(String filter) {
        List<Member> list = memberDao.selectChefRanking(filter);
        // 리스트 내의 모든 VO 객체들을 DTO로 변환
        return list.stream()
                   .map(MemberDto::fromEntity)
                   .collect(Collectors.toList());
    }
    
    @Override
    public MemberDto getMemberStats(long userNo) {
        return memberDao.getMemberStats(userNo); // 매퍼의 통계 쿼리 호출
    }

    @Override
    public List<RecipeDto> selectMyRecipes(Map<String, Object> params) {
        return memberDao.selectMyRecipes(params); // BOARD 테이블 조회
    }

    @Override
    public List<RecipeDto> selectMyScraps(Map<String, Object> params) {
        return memberDao.selectMyScraps(params); // SCRAP + BOARD 조인 조회
    }

    @Override
    public List<InquiryDto> selectMyInquiries(long userNo) {
        return memberDao.selectMyInquiries(userNo); // INQUIRY 테이블 조회
    }

    @Override
    @Transactional // 수정 중 오류 발생 시 롤백을 위해 반드시 필요합니다.
    public int updateProfile(MemberDto memberDto) {
        // 1. 기본 정보 수정 (USER 테이블)
        int result = memberDao.updateMember(memberDto);
        
        // 2. 알레르기 수정 (기존 삭제 후 새 목록 삽입)
        if (result > 0 && memberDto.getAllergies() != null) {
            memberDao.deleteUserAllergies(memberDto.getUserNo());
            for (String allergyName : memberDto.getAllergies()) {
                Map<String, Object> map = new HashMap<>();
                map.put("userNo", memberDto.getUserNo());
                map.put("allergyName", allergyName);
                memberDao.insertUserAllergy(map);
            }
        }
        return result;
    }

    @Override
    public int withdrawMember(long userNo) {
        return memberDao.withdrawMember(userNo); // WITHDRAW = 'Y' 업데이트
    }
    
    @Override
    public InquiryDto selectInquiryDetail(long inquiryNo) {
        // 특정 문의의 상세 내용과 답변을 가져옵니다.
        return memberDao.selectInquiryDetail(inquiryNo);
    }

    @Override
    @Transactional // 데이터 삽입이므로 트랜잭션 처리를 권장합니다.
    public int insertInquiry(InquiryDto inquiryDto) {
        // 사용자가 작성한 제목, 종류, 내용을 저장합니다.
        return memberDao.insertInquiry(inquiryDto);
    }

    @Override
    @Transactional
    public int deleteInquiry(long inquiryNo) {
        // 상세 페이지에서 요청된 삭제 작업을 수행합니다.
        return memberDao.deleteInquiry(inquiryNo);
    }
}