package com.kh.cookmate.member.dto;

import java.time.format.DateTimeFormatter;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MemberDto {
    private long userNo;          
    private String userEmail;
    private String nickname;
    private String profileImageUrl;
    private String introduce;
    
    private String enrollDate; 
    private int recipeCount;
    private int scrapCount;
    private int inquiryCount;  

    private int followerCount;   
    private int followingCount;    
    
    private boolean isFollowing;
    
    private List<String> allergies; 

    private String provider;
    
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String userPw; 
    
    public static MemberDto fromEntity(com.kh.cookmate.member.vo.Member member) {
        if (member == null) return null;
        
        String formattedDate = "";
        if (member.getUserEnrollDate() != null) {
            formattedDate = member.getUserEnrollDate().format(DateTimeFormatter.ofPattern("yyyy년 M월"));
        }
        
        return MemberDto.builder()
                .userNo(member.getUserNo())
                .userEmail(member.getUserEmail())
                .nickname(member.getNickname())
                .profileImageUrl(member.getProfileImageUrl())
                .introduce(member.getIntroduce())
                .recipeCount(member.getRecipeCount())
                .scrapCount(member.getScrapCount())
                .inquiryCount(member.getInquiryCount())
                .enrollDate(formattedDate) 
                .provider(member.getProvider())
                .build();
    }
    

    


}