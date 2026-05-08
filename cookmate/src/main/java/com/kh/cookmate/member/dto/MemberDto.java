package com.kh.cookmate.member.dto;

import java.util.List;
import lombok.*;

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
    
    // 마이페이지 통계 (UI 디자인 반영)
    private int recipeCount;
    private int scrapCount;
    private int inquiryCount;  

    // 회원 정보 수정용 (알레르기 설정 반영)
    private List<String> allergies; 

    /**
     * VO(Entity)를 DTO로 변환하는 메서드
     * VO의 필드 타입도 long userNo로 맞춰주어야 오류가 나지 않습니다.
     */
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
                .inquiryCount(member.getInquiryCount()) // VO에도 해당 필드 추가 필요
                // allergies는 보통 별도 조인이 필요하므로 Service 단에서 별도로 set 해주는 것이 일반적입니다.
                .build();
    }
}