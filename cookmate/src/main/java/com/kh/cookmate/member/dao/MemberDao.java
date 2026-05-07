package com.kh.cookmate.member.dao;

import java.util.List;
import com.kh.cookmate.member.vo.Member;

public interface MemberDao {
    // 1. 마이페이지 유저 정보 조회
    Member selectUserByNo(long userNo);

    // 2. 셰프 랭킹 조회
    List<Member> selectChefRanking(String filter);
}