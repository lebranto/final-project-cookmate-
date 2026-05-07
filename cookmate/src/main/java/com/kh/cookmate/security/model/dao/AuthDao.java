package com.kh.cookmate.security.model.dao;

import java.util.Map;

import org.mybatis.spring.SqlSessionTemplate;
import org.springframework.stereotype.Repository;

import com.kh.cookmate.security.model.dto.AuthDto.User;
import com.kh.cookmate.security.model.dto.AuthDto.UserAuthority;
import com.kh.cookmate.security.model.dto.AuthDto.UserCredential;
import com.kh.cookmate.security.model.dto.AuthDto.UserIdentities;

import lombok.RequiredArgsConstructor;

@Repository
@RequiredArgsConstructor
public class AuthDao {
	
	
	private final SqlSessionTemplate session;

    public User findUserByEmail(String email) {
        return session.selectOne("auth.findUserByEmail" , email);
    }

    public void insertUser(User user) {
        session.insert("auth.insertUser",user);
    }
    
    public void insertCred(UserCredential cred) {
        session.insert("auth.insertCred",cred);
    }
    
    public void insertUserRole(UserAuthority auth) {
        session.insert("auth.insertUserRole",auth);
    }

    public User findUserByUserId(Long userId) {
        return session.selectOne("auth.findUserByUserId" , userId);
    }

    public void insertUserIdentities(UserIdentities userIdentities) {
        session.insert("auth.insertUserIdentities", userIdentities);
    }

    public void updateUserIdentities(UserIdentities userIdentities) {
        session.update("auth.updateUserIdentities" , userIdentities);
    }

    public String getKakaoAccessToken(long userId) {
        return session.selectOne("auth.getKakaoAccessToken", userId);
    }

	public User findUserByProvider(Map<String, Object> param) {
		
		return session.selectOne("auth.findUserByProvider",param);
	}

	public String findNicknameByUserNo(int userNo) {
		// TODO Auto-generated method stub
		return null;
	}


}
