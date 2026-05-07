package com.kh.cookmate.member.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import com.kh.cookmate.member.dao.MemberDao;
import com.kh.cookmate.member.dto.MemberDto;
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
}