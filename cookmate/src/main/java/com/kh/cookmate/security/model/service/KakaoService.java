package com.kh.cookmate.security.model.service;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
@Slf4j
public class KakaoService {
	
	
	private final WebClient webClient;
	
	
	// 카카오 액서스 토큰, 리프레쉬토큰 만료처리 메서드
	public Mono<String> logout(String kakaoAccessToken) {
		return webClient
				 .post()
				 .uri("/v1/user/logout")
				 .header(HttpHeaders.AUTHORIZATION, "Bearer " + kakaoAccessToken)
				 .retrieve()
				 .onStatus(HttpStatusCode::isError, response -> {
					 log.error("카카오 로그아웃 실패");
					 return Mono.error(new RuntimeException("카카오 로그아웃 에러"));
				 })
				 .bodyToMono(String.class);	
		
	}

}
