package com.kh.cookmate.member.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder // 빌더 패턴을 쓰면 VO에서 DTO로 옮길 때 코드가 깔끔해집니다.
public class MemberDto {
    private int userNo;
    private String userEmail;
    private String nickname;
    private String profileImageUrl;
    private String introduce;
    private int recipeCount;
    private int scrapCount;

    // VO를 DTO로 변환해주는 정적 메서드를 만들어두면 편리합니다.
    public static MemberDto fromEntity(com.kh.cookmate.member.vo.Member member) {
        if (member == null) return null;
        
        return MemberDto.builder()
                .userNo(member.getUserNo())
                .userEmail(member.getUserEmail())
                .nickname(member.getNickname())
                .profileImageUrl(member.getProfileImageUrl())
                .introduce(member.getIntroduce())
                .recipeCount(member.getRecipeCount())
                .scrapCount(member.getScrapCount())
                .build();
    }
}