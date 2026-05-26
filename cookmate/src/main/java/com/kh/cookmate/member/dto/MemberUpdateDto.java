package com.kh.cookmate.member.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data 
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MemberUpdateDto {
    private long userNo;
    private String nickname;
    private String introduce;
    private String profileImageUrl;
    private String address;
    
    private List<String> allergies;
    private String newPassword;     
}
