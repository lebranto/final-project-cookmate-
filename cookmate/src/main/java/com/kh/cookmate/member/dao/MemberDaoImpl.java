package com.kh.cookmate.member.dao;

import java.util.List;
import org.mybatis.spring.SqlSessionTemplate;
import org.springframework.stereotype.Repository;
import com.kh.cookmate.member.vo.Member;
import lombok.RequiredArgsConstructor;

@Repository
@RequiredArgsConstructor
public class MemberDaoImpl implements MemberDao {

    private final SqlSessionTemplate session;

    @Override
    public Member selectUserByNo(long userNo) {
        // XML의 namespace="user" 인 것을 호출
        return session.selectOne("member.selectUserByNo", userNo);
    }

    @Override
    public List<Member> selectChefRanking(String filter) {
        return session.selectList("member.selectChefRanking", filter);
    }
}