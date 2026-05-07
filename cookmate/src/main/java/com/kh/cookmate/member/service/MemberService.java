package com.kh.cookmate.member.service;

import java.util.List;
import com.kh.cookmate.member.dto.MemberDto;

public interface MemberService {
    
    // 마이페이지: 유저 기본 정보 조회 (VO -> DTO 변환)
    MemberDto selectUserByNo(long userNo);

    // 셰프 리스트: 필터에 따른 랭킹 조회 (List<VO> -> List<DTO> 변환)
    List<MemberDto> selectChefRanking(String filter);
}