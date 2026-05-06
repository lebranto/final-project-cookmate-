package com.kh.cookmate.security.utils;

import java.time.Duration;

import org.springframework.http.ResponseCookie;

import jakarta.servlet.http.HttpServletRequest;

public class CookieUtil {
	public static final String ACCESS_COOKIE = "accessToken";
	public static final String REFRESH_COOKIE = "refreshToken";
	public static final String ROLE_COOKIE = "userRoles";
	
	public static ResponseCookie createTokenCookie(
			String name, String value , long maxAgeDays
			) {
		return ResponseCookie.from(name,value)
				.httpOnly(name.equals(REFRESH_COOKIE))
				.secure(false) // 개발환경에서만 false
				.path("/")
				.sameSite("Lax") // CSRF방어
				.maxAge(
					maxAgeDays == 0 ? Duration.ZERO : 
					name.equals(REFRESH_COOKIE) ? 
							Duration.ofDays(maxAgeDays) :
//						    Duration.ofMinutes(maxAgeDays)
							Duration.ofSeconds(10)	
						) // 만료시간
				.build();
		
	}
	
	public static String resolberAccessToken(HttpServletRequest req) {
		String bearerToken = req.getHeader("Authorization");
		
		if(bearerToken !=null && bearerToken.startsWith("Bearer ")) {
			return bearerToken.substring(7).trim();
		}
		
		return null;
		// 확인용
	}
	
}
