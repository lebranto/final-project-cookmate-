package com.kh.cookmate.member.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data 
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FollowDto {
	
    private long userNo;
    private String nickname;
    private String userEmail;
    private String profileImageUrl;
    private int recipeCount;   
    private int followerCount;  
    private boolean following;  
}
