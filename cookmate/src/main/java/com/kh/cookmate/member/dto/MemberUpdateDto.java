package com.kh.cookmate.member.dto;

import java.util.List;

import lombok.Data;

@Data // Lombok 사용 시
public class MemberUpdateDto {
    private long userNo;
    private String nickname;
    private String introduce;
    private String profileImageUrl;
    
    private List<String> allergies;
    private String newPassword;     
}
