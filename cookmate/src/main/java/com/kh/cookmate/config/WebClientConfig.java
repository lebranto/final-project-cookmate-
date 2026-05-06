package com.kh.cookmate.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

	
	/*
	 * #1. WebClient
	 *  - Spring5 버전부터 도입된 http 요청 도구로 동기 방식 비동기 방식을 모두 지원한다.
	 *  - 이벤트 루프방식으로 처리되어 기존의 RestTemplate에 비해 자원을 효율적으로
	 *  사용할 수 있다.  
	 *  - WebClient의 비동기 데이터 스트림으로는 Mono와 Flux가 있다.
	 *  - WebClient는 지연실행을 사용하기 때문에, subscribe(), block()dmf
	 *  호출하기 전까지 실제 http요청을 실행하지 않는다. 
	 * 	   block() : 동기식 처리 요청
	 * 	   subscribe : 비동기식 요청
	 * 
	 * #2. Mono
	 *  - api가 반환하는 값이 0개 또는 1개인 경우 사용하는 스트림
	 *  - 단일객체 조회나, put, delete, post등에 사용
	 *  
	 * #3. Flux
	 *  - api가 반환하는 값이 1개 이상인 경우 사용하는 스트림
	 *  - 라스트 조회나 스트리밍 방식 응답에 사용한다.
	 *  - 데이터를 하나씩 순서대로 발행한다.
	 * 
	 * */
		
	@Bean
	public WebClient webClient() {
		return WebClient.builder()
						.baseUrl("https://kapi.kakao.com")
						.defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
						.build();
			}
}
