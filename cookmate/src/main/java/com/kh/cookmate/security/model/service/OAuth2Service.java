package com.kh.cookmate.security.model.service;

import java.util.List;
import java.util.Map;

import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.kh.cookmate.security.controller.AuthController;
import com.kh.cookmate.security.model.dao.AuthDao;
import com.kh.cookmate.security.model.dto.AuthDto.User;
import com.kh.cookmate.security.model.dto.AuthDto.UserAuthority;
import com.kh.cookmate.security.model.dto.AuthDto.UserIdentities;
import com.kh.cookmate.security.model.dto.CustomOAuth2User;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class OAuth2Service implements OAuth2UserService<OAuth2UserRequest, OAuth2User>{
		
	/*
	 * #1. OAuth2(Open Authorization)
	 *  - API서버에서 사용자 대신 제 3자 앱에 접근할 수 있도록 권한을 위임하는
	 *  개방형 표준 프로토콜
	 *  - 사용자는 제3자의 앱에서 제공하는 인증페이지에서 인증을 진행하고, 인가 권한을 
	 *  백엔드서버에 위임하여 제 3자앱의 비밀번호를 백엔드에 전달하지 않고, 특정 서비스의 
	 *  정보를 백엔드에서 이용할 수 있게 해준다.
	 *  - OAuth2프로토콜 사용시 사용자는 자신의 앱 비밀번호가 노출되지 않기 때문에, 클라이언트
	 *  서버가 해킹당하더라도 안전하며, 매번 새로운 서비스에 가입할 필요 없이 기존 계정을
	 *  간편하게 로그인 할 수 있다.
	 *  
	 *  #2. OAuth2의 구성요소
	 *   - Resource Owner : 로그인하려는 사용자
	 *   - Client : 사용자의 권한을 위임받아 리소스에 접근하려는 서버
	 *   - Resource Server : 사용자의 정보를 가지고 있는 서버.
	 *   - Authorization Server : 클라이언트에게 접근 권한을 부여하는 인증서버
	 * 
	 * */
	
	private final AuthController authController;
	private final AuthDao authDao;
	
	
	/*
	 * 인증 완료 후, OAuth2User 객체를 전달받아, 원하는 비지니스로직을 작성할 예정
	 * dv에서 사용자 정보 조회 후, 존재하지 않는 사용자라면 자동 회원가입, 존재하는 
	 * 회원이라면 로그인
	 * 
	 * */
	
	@Transactional
	@Override
	public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
		OAuth2User oAuth2User = new DefaultOAuth2UserService().loadUser(userRequest);
		
		Map<String, Object> attributes = oAuth2User.getAttributes();
		String provider = userRequest.getClientRegistration().getRegistrationId();
		
		String providerUserId = String.valueOf(attributes.get("id"));
		String accessToken = userRequest.getAccessToken().getTokenValue();
		
		if(provider.equals("kakao")) {
			Map<String,Object> kakaoAccount = (Map<String,Object>) attributes.get("kakao_account");
			String email = (String) kakaoAccount.get("email");
			Map<String,Object> profile = (Map<String,Object>) kakaoAccount.get("profile");
			
			// 데이터베이스에서 회원정보 조회
			//User user = authDao.findUserByEmail(email);
			Map<String,Object> param = Map.of("provider",provider,"providerId",providerUserId);
			User user = authDao.findUserByProvider(param);
			
			
			if(user ==null) {
				// 새로운 사용자인 경우 자동 회원가입
				user = User.builder()
						.email(email)
						.name((String) profile.get("nickname"))
						.profile((String) profile.get("profile_image_url"))
						.build();
				authDao.insertUser(user);
				
				// 유저 소셜정보
				UserIdentities userIdentities = UserIdentities.builder()
												.provider(provider)
												.providerUserId(providerUserId)
												.accessToken(accessToken)
												.userId(user.getId())
												.build();
				
				authDao.insertUserIdentities(userIdentities);
				
				UserAuthority auth = UserAuthority.builder()
													.userId(user.getId())
													.roles(List.of("ROLE_USER"))
													.build();
				authDao.insertUserRole(auth);
				// 자동 회원가입 끝
			}
			
			// 이미 회원가입은 된 경우 => 로그인처리
			UserIdentities userIdentities  = UserIdentities.builder()
															.provider(provider)
														    .providerUserId(providerUserId)
														    .accessToken(accessToken)
														    .build();
			authDao.updateUserIdentities(userIdentities);
			
			return new CustomOAuth2User(
					oAuth2User.getAuthorities() ,
					attributes,
					"id",
					user.getId()
					);
			
		}
		
		return new DefaultOAuth2User(oAuth2User.getAuthorities(), attributes,"id");
		
	}
	

}
