package com.kh.cookmate.member.vo;

import java.time.LocalDateTime;

import org.apache.ibatis.type.Alias;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Alias("Member")
public class Member {
    private long userNo;
    private String userEmail;
    private String userPw;
    private String nickname;
    private String profileImageUrl;
    private String introduce;
    private LocalDateTime userEnrollDate;
    private int warning;
    private String userStatus;
    private String withdraw;
    
    private int recipeCount;   
    private int scrapCount;    
    private int inquiryCount;
    
    private String provider;
    
}