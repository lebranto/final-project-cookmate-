package com.kh.cookmate.member.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InquiryDto {
    private long inquiryNo;
    private long userNo;
    private String title;
    private String content;
    private String createDate;
    private String typeName;
    
    private char status; 
    
    private String answer;     
    private String answerDate;
}