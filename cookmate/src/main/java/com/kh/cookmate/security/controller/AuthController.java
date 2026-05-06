package com.kh.cookmate.security.controller;


import static com.kh.cookmate.security.utils.CookieUtil.ACCESS_COOKIE;
import static com.kh.cookmate.security.utils.CookieUtil.REFRESH_COOKIE;
import static com.kh.cookmate.security.utils.CookieUtil.ROLE_COOKIE;
import static com.kh.cookmate.security.utils.CookieUtil.createTokenCookie;

import java.util.stream.Collectors;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kh.cookmate.security.model.dto.AuthDto.AuthResult;
import com.kh.cookmate.security.model.dto.AuthDto.LoginRequest;
import com.kh.cookmate.security.model.dto.AuthDto.User;
import com.kh.cookmate.security.model.provider.JWTProvider;
import com.kh.cookmate.security.model.service.AuthService;
import com.kh.cookmate.security.model.service.KakaoService;
import com.kh.cookmate.security.utils.CookieUtil;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;


import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequiredArgsConstructor
@RequestMapping("/auth")
@Slf4j
public class AuthController {

	private final AuthService service;
	private final KakaoService kakaoService;
	private final JWTProvider jwt;

	
	@PostMapping("/login")
	public ResponseEntity<AuthResult> login(@RequestBody LoginRequest req){
		/*
		 * 로그인
		 *  - 현재 db에 존재하지 않는 이메일이면 404에러 반환
		 *  - 프런트에서는 응답상태가 404인 경우 회원가입할지, 재로그인 할지 처리
		 *  - 이메일은 존재하나 비밀번호가 틀린경우 401상태(미인증)반환 => 재로그인
		 *  - 모두 성공시 유저정보와 JWT토큰 반환
		 * */
		
		// 1) 사용자가 존재하는지 확인
		
		boolean exists = service.existsByEmail(req.getEmail());
		
		
		if(!exists) {
			//2) 사용자가 존재하지 않는 경우 404 상태 반환
			return ResponseEntity.notFound().build();
		}
		
		// 3) 사용자가 존재한다면 인증처리하고, 사용자정보 반환
		
		try {
		AuthResult result = service.login(req.getEmail(),req.getPassword());
		
		// 인증 성공시 accessToken, refreshToken 생성하여 클라이언트의 쿠키로 전달.
		return makeResponse(result);	
		
		}catch(BadCredentialsException e) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}
		
	}
	
	/*
	 * 자동 회원가입
	 * */
	
	@PostMapping("/signup")
	public ResponseEntity<AuthResult> signup(
			@RequestBody LoginRequest req){
		AuthResult result = service.signup(req);
		return makeResponse(result);
		
	}
	
	
	
	
	
	private ResponseEntity<AuthResult> makeResponse(AuthResult result){
		// AccessToken을 쿠키에 담아서 전달
			ResponseCookie accessCookie = createTokenCookie(ACCESS_COOKIE, result.getAccessToken(),30);
			ResponseCookie refreshCookie = 
					createTokenCookie(REFRESH_COOKIE, result.getAccessToken(),7);
			
			String roles = result.getUser().getRoles()
					.stream().collect(Collectors.joining("|"));
			
			ResponseCookie roleCookie = createTokenCookie(ROLE_COOKIE,roles,30);
			
			return ResponseEntity
					.ok()
					.header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
					.header(HttpHeaders.SET_COOKIE, accessCookie.toString())
					.header(HttpHeaders.SET_COOKIE,roleCookie.	toString())
					.body(result);
			
	}
	
	@PostMapping("/logout")
	public ResponseEntity<Void> logout(HttpServletRequest req){
		// 클라이언트의 헤더에서 id값 추출
		String accessToken = CookieUtil.resolberAccessToken(req);
		
		if(accessToken != null) {
			// accessToken 에 값이 있다면 카카오 서비스 로그아웃 요청
			// 클라이언트의 헤더에서 id값 추출
			Long userId = jwt.getUserId(accessToken, ACCESS_COOKIE);
			
			// db에서 사용자의 카카오 엑서스토큰 조회
			String kakaoAccessToken = service.getkakaoAccessToken(userId);
			
			
			// 카카오에서 로그아웃 요청처리
			if(kakaoAccessToken != null) kakaoService.logout(kakaoAccessToken).subscribe();
			
		}
		
		// 로그아웃처리(쿠키 만료처리)
		ResponseCookie refresh = createTokenCookie
				                  (REFRESH_COOKIE, "", 0);
		ResponseCookie access = createTokenCookie
				                  (ACCESS_COOKIE, "", 0);
		ResponseCookie roles = createTokenCookie
				                  (ROLE_COOKIE, "", 0);
		
		
		return ResponseEntity.noContent()
				             .header(HttpHeaders.SET_COOKIE, refresh.toString())
				             .header(HttpHeaders.SET_COOKIE, access.toString())
				             .header(HttpHeaders.SET_COOKIE, roles.toString())
				             .build();
		
		
	}
	
	
	
	//accessToken 재발급 url
	@PostMapping("/refresh")
	public ResponseEntity<AuthResult> refresh(
			@CookieValue(name = REFRESH_COOKIE, required = false) 
			String refreshCookie
			){
		if(refreshCookie==null || refreshCookie.isBlank()) {
			// 401에러 발생
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}
		
		// 쿠키가 있으면 쿠키를 검증하여 새로운 accessToken 생성
		AuthResult result = service.refreshByCookie(refreshCookie);
		
		// 새로 발급된 토큰을 쿠키에 담기
		ResponseCookie accessCookie = 
				       createTokenCookie(ACCESS_COOKIE,result.getAccessToken(), 30);
		
		String roles = result.getUser().getRoles().stream()
				.collect(Collectors.joining("|"));
		
		ResponseCookie roleCookie =
				createTokenCookie(ROLE_COOKIE, roles, 30);
		
		return ResponseEntity.ok()
				.header(HttpHeaders.SET_COOKIE,accessCookie.toString())
				.header(HttpHeaders.SET_COOKIE,roleCookie.toString())
				.build();
		
	}
	
	
	//  사용자 정보 요청요 api
	@GetMapping("/me")
	public ResponseEntity<User> getUserInfo(HttpServletRequest req){
		// 요청헤더에서 토큰 추출
		String accessToken = CookieUtil.resolberAccessToken(req);
		if(accessToken == null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}
		
		// id 추출
		Long userId = jwt.getUserId(accessToken, ACCESS_COOKIE);
		
		// 사용자 정보 조회
		User user = service.findUserByUserId(userId);
		
		if(user==null) {
			return ResponseEntity.notFound().build();
		}
		
		return ResponseEntity.ok(user);
		
	}
	
	
	
}
