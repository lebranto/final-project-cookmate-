package com.kh.cookmate.security.utils;

import java.time.Duration;

import org.springframework.http.ResponseCookie;
import jakarta.servlet.http.Cookie;
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
						    Duration.ofMinutes(maxAgeDays)
						) // 만료시간
				.build();
		
	}
	
	public static String resolberAccessToken(HttpServletRequest req) {
	    String bearerToken = req.getHeader("Authorization");

	    if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
	        return bearerToken.substring(7).trim();
	    }

	    Cookie[] cookies = req.getCookies();

	    if (cookies == null) {
	        return null;
	    }

	    for (Cookie cookie : cookies) {
	        if (ACCESS_COOKIE.equals(cookie.getName())) {
	            return cookie.getValue();
	        }
	    }

	    return null;
	}
	
}
