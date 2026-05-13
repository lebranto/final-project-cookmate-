package com.kh.cookmate.member.vo;

import java.util.Date;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class Inquiry {
    private long inquiryNo; 
    private long userNo; 
    private String inquiryTitle;
    private String inquiryContent;
    private char inquiryStatus;
    private Date inquiryPostdate;
    private String typeName;
}