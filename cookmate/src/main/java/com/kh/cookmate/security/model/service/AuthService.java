package com.kh.cookmate.security.model.service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.kh.cookmate.security.model.dao.AuthDao;
import com.kh.cookmate.security.model.dto.AuthDto.AuthResult;
import com.kh.cookmate.security.model.dto.AuthDto.LoginRequest;
import com.kh.cookmate.security.model.dto.AuthDto.LoginResponse;
import com.kh.cookmate.security.model.dto.AuthDto.SignupRequest;
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
	private final Map<String, String> emailCodeStore = new ConcurrentHashMap<>();
	private final KakaoService service;
	private final JWTProvider jwt;
	
	public boolean existsByEmail(String email) {
		
		User user = authDao.findByEmail(email);
		if(user == null) {
			throw new BadCredentialsException("이메일 또는 비밀번호가 일치하지 않습니다.");
		}
		
		return user != null;
	}

	
	public AuthResult login(String email, String pw) {
		// 1. 사용자 정보 조회
		User user = authDao.findByEmail(email);
		if(user == null) {
			throw new BadCredentialsException("이메일 또는 비밀번호가 일치하지 않습니다.");
		}
		if(!encoder.matches(pw, user.getUserPw())) {
			throw new BadCredentialsException("비밀번호가 일치하지 않습니다.");
		}
		
		// 2) 토큰 발급 처리
		String accessToken = jwt.createAccessToken(user.getUserNo(),30);
		String refreshToken = jwt.createRefreshToken(user.getUserNo(),1);
		 
		User userNoPassword = User
				               .builder()
				               .userNo(user.getUserNo())
				               .userEmail(user.getUserEmail())
				               .nickname(user.getNickname())
				               .profileImageUrl(user.getProfileImageUrl())
				               .introduce(user.getIntroduce())
				               .address(user.getAddress())
				               .roles(user.getRoles())
				               .build();
		
		return AuthResult.builder()
				         .accessToken(accessToken)
				         .refreshToken(refreshToken)
				         .user(userNoPassword)
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

	
	
	// 로그인 토큰 없는거
	
	@Transactional
	public LoginResponse login2(LoginRequest req) {

	    User user = authDao.findByEmail(req.getUserEmail());

	    System.out.println("로그인 요청 이메일 = " + req.getUserEmail());
	    System.out.println("DB 조회 결과 = " + user);

	    if (user == null) {
	        throw new ResponseStatusException(
	            HttpStatus.UNAUTHORIZED,
	            "이메일 또는 비밀번호가 일치하지 않습니다."
	        );
	    }

	    System.out.println("입력 비밀번호 = " + req.getUserPw());
	    System.out.println("DB 비밀번호 = " + user.getUserPw());

	    boolean matches = encoder.matches(
	        req.getUserPw(),
	        user.getUserPw()
	    );

	    System.out.println("비밀번호 일치 여부 = " + matches);

	    if (!matches) {
	        throw new ResponseStatusException(
	            HttpStatus.UNAUTHORIZED,
	            "이메일 또는 비밀번호가 일치하지 않습니다."
	        );
	    }

	    authDao.updateLastLogin(user.getUserNo());

	    // JWT를 아직 안 붙였다면 임시값으로 테스트 가능
	    String accessToken = "test-token";

	    return LoginResponse.builder()
	            .userNo(user.getUserNo())
	            .userEmail(user.getUserEmail())
	            .nickname(user.getNickname())
	            .accessToken(accessToken)
	            .build();
	}
	
	
	
	
	
	//회원 가입 코드
	@Transactional
	public void signup(SignupRequest req) {
		 int count = authDao.existsByEmail(req.getUserEmail());

	        if (count > 0) {
	            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
	        }

	        String encodedPw = encoder.encode(req.getUserPw());
	        req.setUserPw(encodedPw);

	        authDao.insertUser(req);
	        authDao.insertUserCredentials(req);
	        authDao.insertAuthority(req);

	        if (req.getAllergies() != null && !req.getAllergies().isEmpty()) {
	            authDao.insertAllergies(req);
	        }
		
	}
	
	
	// 이메일로 인증 번호 보내는 코드
	public void sendEmailCode(String email) {
		
		// 랜덤 번호로 인증번호 보낼때, 나중에 배포할때는 풀기
	    //String code = String.valueOf((int)(Math.random() * 900000) + 100000);
	    
		// 개발중 연습용으로 사용할때 
		String code = "123456";
	    

	    emailCodeStore.put(email, code);

	   // 나중에 랜덤번호로 바꿀시 확인하기 위해서
	   // System.out.println("인증번호: " + code);

	    // 나중에 실제 이메일 발송 로직 추가
	}

	
	// 인증 번호 확인 로직
	public void verifyEmailCode(String email, String code) {
	    String savedCode = emailCodeStore.get(email);

	    if (savedCode == null || !savedCode.equals(code)) {
	        throw new IllegalArgumentException("인증 코드가 일치하지 않습니다.");
	    }

	    emailCodeStore.remove(email);
	}


	public AuthResult login(LoginRequest req) {
		return login(req.getUserEmail(), req.getUserPw());
	}
	

}
