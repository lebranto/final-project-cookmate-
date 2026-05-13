package com.kh.cookmate.security.model.handler;

import java.io.IOException;
import java.util.stream.Collectors;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import com.kh.cookmate.security.model.dto.CustomOAuth2User;
import com.kh.cookmate.security.model.provider.JWTProvider;
import com.kh.cookmate.security.utils.CookieUtil;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
@RequiredArgsConstructor
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler{
	
	
	private final JWTProvider jwt;
	
	
	
	// Oatuh2방식 인증 성공시 실행할 이벤트 핸들러
	// 클라이언트에게 access, refresh 토큰등을 발급.
	
	
	@Override
	public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
			Authentication authentication) throws IOException, ServletException {
	CustomOAuth2User oauthUser = 
			       (CustomOAuth2User)authentication.getPrincipal();
	
	
	Long id = (Long) oauthUser.getUserId();
	
	String accessToken = jwt.createAccessToken(id, 30);
	String refreshToken = jwt.createRefreshToken(id, 7);
	String roles = oauthUser.getAuthorities().stream()
			                .map(GrantedAuthority::getAuthority)
			                .collect(Collectors.joining("|"));
		
	ResponseCookie accessCookie = CookieUtil.createTokenCookie( CookieUtil.ACCESS_COOKIE, accessToken.toString(),30);
	ResponseCookie refreshCookie = CookieUtil.createTokenCookie(CookieUtil.REFRESH_COOKIE, refreshToken.toString(), 7);
	ResponseCookie roleCookie = CookieUtil.createTokenCookie(CookieUtil.ROLE_COOKIE, roles, 30);
	
	
	response.addHeader(HttpHeaders.SET_COOKIE, accessCookie.toString());
	response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());
	response.addHeader(HttpHeaders.SET_COOKIE, roleCookie.toString());
	
	String redirect = UriComponentsBuilder.fromUriString("http://localhost:3000/oauth2/success")
			.build().toUriString();
	
	response.sendRedirect(redirect);
			
	}
}
