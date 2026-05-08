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
    
    private char status; // 답변 여부 (Y/N 처리)
    
    private String answer;      // 관리자 답변
    private String answerDate;
}