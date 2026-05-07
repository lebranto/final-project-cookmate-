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
    private int userNo;
    private String userEmail;
    private String userPw;
    private String nickname;
    private String profileImageUrl;
    private String introduce;
    private LocalDateTime userEnrollDate;
    private int warning;
    private String userStatus;
    private String withdraw;
    
 // 랭킹 지표 필드
    private int recipeCount;    // 작성한 레시피 수
    private int scrapCount;     // 내 레시피가 스크랩된 총 횟수
    
    
}