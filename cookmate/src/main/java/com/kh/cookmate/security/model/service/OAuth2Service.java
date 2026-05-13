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
import org.springframework.security.core.authority.SimpleGrantedAuthority;

@Service
@RequiredArgsConstructor
@Slf4j
public class OAuth2Service implements OAuth2UserService<OAuth2UserRequest, OAuth2User>{
		
	
	
	private final AuthController authController;
	private final AuthDao authDao;
	
	
	
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
			String userEmail = email != null && !email.isBlank()
					? email
					: provider + "_" + providerUserId + "@oauth.local";
			
			// 데이터베이스에서 회원정보 조회
			Map<String,Object> param = Map.of("provider",provider,"providerId",providerUserId);
			User user = authDao.findUserByProvider(param);
			
			
			if(user ==null) {
				// 새로운 사용자인 경우 자동 회원가입
				user = User.builder()
						.userEmail(userEmail)
						.nickname((String) profile.get("nickname"))
						.profileImageUrl((String) profile.get("profile_image_url"))
						.build();
				authDao.insertUser(user);
				
				// 유저 소셜정보
				UserIdentities userIdentities = UserIdentities.builder()
												.provider(provider)
												.providerUserNo(providerUserId)
												.accessToken(accessToken)
												.userNo(user.getUserNo())
												.build();
				
				authDao.insertUserIdentities(userIdentities);
				
				UserAuthority auth = UserAuthority.builder()
													.userNo(user.getUserNo())
													.roles(List.of("ROLE_USER"))
													.build();
				authDao.insertUserRole(auth);
				// 자동 회원가입 끝
			}
			
			// 이미 회원가입은 된 경우 => 로그인처리
			UserIdentities userIdentities  = UserIdentities.builder()
															.provider(provider)
														    .providerUserNo(providerUserId) //의심
														    .accessToken(accessToken)
														    .build();
			authDao.updateUserIdentities(userIdentities);
			
			return new CustomOAuth2User(
					List.of(new SimpleGrantedAuthority("ROLE_USER")),
					attributes,
					"id",
					user.getUserNo()

					);
			
			
			
		}
		
		return new DefaultOAuth2User(oAuth2User.getAuthorities(), attributes,"id");
		
	}
	

}
