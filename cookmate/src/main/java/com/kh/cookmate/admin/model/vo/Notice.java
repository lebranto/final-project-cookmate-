package com.kh.cookmate.admin.model.vo;

import java.util.Date;

import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@Data
public class Notice {
	private int noticeNo;
	private int userNo;
	private String noticeTitle;
	private String noticeContent;
	private Date noticeModifiedDate;
	private Date startDate;
	private Date endDate;
	private char noticeStatus;
	private char noticeDelete;
	private String typeName;
}
