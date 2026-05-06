package com.kh.cookmate.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.kh.cookmate.security.filter.JWTAuthenticationFilter;
import com.kh.cookmate.security.model.handler.OAuth2SuccessHandler;
import com.kh.cookmate.security.model.service.OAuth2Service;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;



@Configuration
@RequiredArgsConstructor
@EnableWebSecurity
public class SecurityConfig {

		// 시큐리티 형태를 xml이 아닌 java 형태로 만든다.
		
	@Bean
	public SecurityFilterChain filterchain(
			HttpSecurity http, 
			JWTAuthenticationFilter JWtFilter,
			OAuth2Service service,			
			OAuth2SuccessHandler handler
			) throws Exception {
			//http 관련 보안 설정
			http
			 .cors(cors -> cors.configurationSource(corsConfigurationSource()))
			 .csrf(csrf -> csrf.disable())
			 .exceptionHandling(e -> e.authenticationEntryPoint((req,res,ex)->{
				 //인증실패시 401에러
				 res.sendError(HttpServletResponse.SC_UNAUTHORIZED,"UNAUTHORIZED");
			 })
				//인가 실패시 403에러
			 .accessDeniedHandler((req, res , ex)->{
				 res.sendError(HttpServletResponse.SC_FORBIDDEN,"FORBIDDEN");
			 })).sessionManagement(management -> 
			 	management.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
			 //.oauth2인증설정
			 .oauth2Login(oauth -> oauth
					 			  .userInfoEndpoint(u -> u.userService(service))
					 			  .successHandler(handler)
					     )
			 // 인가 url 설정
			 .authorizeHttpRequests(auth ->
			 		auth
			 		.requestMatchers("/auth/login","/auth/signup","/auth/logout","/auth/refresh").permitAll()
					.requestMatchers("/oauth2/**","/login**","/error").permitAll()
					.requestMatchers("/**").authenticated()
					);
			
			// 어떤 필터 전에 추가할지 결정하는 메서드
			http.addFilterBefore(JWtFilter, UsernamePasswordAuthenticationFilter.class);
					 
			return http.build();
		
		
	}
	
	// CORS설정정보를 가진 빈객체
	public CorsConfigurationSource corsConfigurationSource() {
		CorsConfiguration config = new CorsConfiguration();
		
		// 허용 Origin 설정 
		config.setAllowedOrigins(List.of("http://localhost:3000"));
		
		// 허용 메서드 설정
		config.setAllowedMethods(List.of("GET","POST","PUT","PATCH","DELETE"));

		// 허용 헤더 설정
		config.setAllowedHeaders(List.of("*"));
		config.setExposedHeaders(List.of("Location","Authorization"));
		config.setAllowCredentials(true);
		config.setMaxAge(3600L);
		
		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", config);
		
		return source;
		
	}
	
	
	@Bean
	public PasswordEncoder passwordEncorder() {
		PasswordEncoder encoder = new BCryptPasswordEncoder();
		return encoder;
	} 
	
	
}