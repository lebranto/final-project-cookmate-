package com.kh.cookmate.security.model.service;

import java.util.List;

import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.kh.cookmate.security.model.dao.AuthDao;
import com.kh.cookmate.security.model.dto.AuthDto.AuthResult;
import com.kh.cookmate.security.model.dto.AuthDto.LoginRequest;
import com.kh.cookmate.security.model.dto.AuthDto.User;
import com.kh.cookmate.security.model.dto.AuthDto.UserAuthority;
import com.kh.cookmate.security.model.dto.AuthDto.UserCredential;
import com.kh.cookmate.security.model.provider.JWTProvider;
import com.kh.cookmate.security.utils.CookieUtil;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {
	
	private final AuthDao authDao;
	private final PasswordEncoder encoder; // bean객체 securityConfig에 만들기 
	private final KakaoService service;
	private final JWTProvider jwt;
	
	public boolean existsByEmail(String email) {
		
		User user = authDao.findUserByEmail(email);
		
		return user != null;
	}

	public AuthResult login(String email, String password) {
		// 1. 사용자 정보 조회
		User user = authDao.findUserByEmail(email);
		if(!encoder.matches(password, user.getPassword())) {
			throw new BadCredentialsException("비밀번호가 일치하지 않습니다.");
		}
		
		// 2) 토큰 발급 처리
		String accessToken = jwt.createAccessToken(user.getId(),30);
		String refreshToken = jwt.createRefreshToken(user.getId(),7);
		 
		User userNoPassword = User
				               .builder()
				               .id(user.getId())
				               .email(user.getEmail())
				               .profile(user.getProfile())
				               .name(user.getName())
				               .roles(user.getRoles())
				               .build();
		
		return AuthResult.builder()
				         .accessToken(accessToken)
				         .refreshToken(refreshToken)
				         .user(userNoPassword)
				         .build();
	}

	
	@Transactional
	public AuthResult signup(LoginRequest req) {
		String email =req.getEmail();
		String password = req.getPassword();
		
		// 1) Users테이블에 데이터 추가
		User user = User
				    .builder()
				    .email(email)
				    .name(email.split("@")[0])
				    .build();
		
		authDao.insertUser(user);
		
		// 2) Credential에 데이터 추가
		
		UserCredential cred = UserCredential
				                 .builder()
				                 .userId(user.getId())
				                 .password(encoder.encode(password))
				                 .build();
		authDao.insertCred(cred);
		
		// 3) 권한추가
		UserAuthority auth = UserAuthority
				                   .builder()
				                   .userId(user.getId())
				                   .roles(List.of("ROLE_USER"))
				                   .build();
		
		
		authDao.insertUserRole(auth);
		
		// 4) 회원 가입 완료 후 , 토큰 발급 
		String accessToken = jwt.createAccessToken(user.getId(),30);
		String refreshToken = jwt.createRefreshToken(user.getId(),7);
		
		user = authDao.findUserByUserId(user.getId()); // 비밀번호가 제외된 유저정보
		
		return AuthResult.builder()
				 .accessToken(accessToken)
				 .refreshToken(refreshToken)
				 .user(user)
				 .build();
	}

	public AuthResult refreshByCookie(String refreshCookie) {
		Long userId = jwt.getUserId(refreshCookie, CookieUtil.REFRESH_COOKIE);
		User user = authDao.findUserByUserId(userId);
		
		String accessToken = jwt.createAccessToken(userId, 30);

		return AuthResult.builder()
				         .accessToken(accessToken)
				         .user(user)
				         .build();
	}

	public User findUserByUserId(Long userId) {
		return authDao.findUserByUserId(userId);
	}

	public String getkakaoAccessToken(Long userId) {
		
		return authDao.getKakaoAccessToken(userId);
	}
}
