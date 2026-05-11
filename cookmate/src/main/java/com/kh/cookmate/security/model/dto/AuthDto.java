package com.kh.cookmate.security.model.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;



public class AuthDto {

	
	// 로그인을 위한 데이터 
	@Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LoginRequest{
        private String userEmail;
        private String userPw;
    }
	
	
	 @Data
	    @NoArgsConstructor
	    @AllArgsConstructor
	    @Builder
	    public static class LoginResponse {
	        private Long userNo;
	        private String userEmail;
	        private String nickname;
	        private String accessToken;
	    }
	
	
	
	
	// 토큰 나중에 할거
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AuthResult {
        private String accessToken;
        private String refreshToken;
        private User user;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class User{
        private Long userNo;
        private String userEmail;
        private String userPw;
        private String nickname;
        private String profileImageUrl;
        private String introduce;
        private String address;
        private List<String> roles;
       
    }


    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserCredential {
        private Long userNo;
        private String userPw;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserAuthority {
        private Long userNo;
        private List<String> roles;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserIdentities {
        private Long id;
        private Long userNo;
        private String accessToken;
        private String provider;
        private String providerUserNo;
    }
    
    
    // 회원 가입을 위한 데이터
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SignupRequest {
        private Long userNo;

        private String userEmail;
        private String userPw;
        private String nickname;
        private String introduce;
        private String address;

        private List<String> allergies;
    }
    	
    // 이메일 발송을 위한 데이터
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class EmailSendRequest {
        private String email;
    }
    
    // 이메일 인증을 위한 데이터
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class EmailVerifyRequest {
        private String email;
        private String code;
    }
    
}
