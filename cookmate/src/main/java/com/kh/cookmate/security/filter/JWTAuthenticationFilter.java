package com.kh.cookmate.security.filter;

import java.io.IOException;

import java.io.IOException;
import java.net.http.HttpResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.kh.cookmate.security.model.dao.AuthDao;
import com.kh.cookmate.security.model.dto.AuthDto.User;
import com.kh.cookmate.security.model.provider.JWTProvider;
import com.kh.cookmate.security.model.service.AuthService;
import com.kh.cookmate.security.utils.CookieUtil;

import io.jsonwebtoken.ExpiredJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpMethod;


@Slf4j
@Component
@RequiredArgsConstructor
public class JWTAuthenticationFilter extends OncePerRequestFilter{
	
	private final JWTProvider jwt;
	private final AuthDao dao;
	
	
	/*
	 * AccessToken 확인용 필터
	 *  -클라이언트가 header로 전달한 토큰을 추출하여 , 인증처리 및 인증토큰 생성
	 * 
	 * */
	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {
		

	    if (HttpMethod.OPTIONS.matches(request.getMethod())) {
	        filterChain.doFilter(request, response);
	        return;
	    }
		
		
		// 1) 요청 헤더에서 인증토큰 추출
		
		try {
			String header = request.getHeader("Authorization");
			if(header !=null && header.startsWith("Bearer ")) {
				
				// 2) 헤더에서 토큰 추출
				String token = header.substring(7).trim();
				log.debug("token : {}", token);
				
				
				// 3) 토큰에서 userId 추출
				Long userId = jwt.getUserId(token,CookieUtil.ACCESS_COOKIE);
				log.debug("userID : {}", userId);
				
				
				// 4) 사용자 정보 조회
				
				User u = dao.findUserByUserId(userId);
				
				
				// 5) 인증토큰 생성
//				UsernamePasswordAuthenticationToken authToken
//				 = new UsernamePasswordAuthenticationToken(userId,null,u.ge()
//						                                                .stream()
//						                                                .map(s -> new SimpleGrantedAuthority(s))
//						                                                .toList());
				
				// 6) 스레드 로컬에 토큰 저장
//				SecurityContextHolder.getContext().setAuthentication(authToken);
				
			}
			
		}catch(ExpiredJwtException e){
			// 인증정보가 있었다면 초기화
			 SecurityContextHolder.clearContext();
			 // 401에러 반환
			 response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
			 return;
		}
		
		
		
		filterChain.doFilter(request, response);
		
	}
	


}