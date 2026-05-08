package com.kh.cookmate.member.vo;

import java.util.Date;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class Inquiry {
    private long inquiryNo;      // BIGINT
    private long userNo;         // BIGINT
    private String inquiryTitle; // VARCHAR(50)
    private String inquiryContent; // VARCHAR(500)
    private char inquiryStatus;  // CHAR(1)
    private Date inquiryPostdate; // DATETIME
    private String typeName;     // TYPE_NAME (계정, 레시피 등)
}