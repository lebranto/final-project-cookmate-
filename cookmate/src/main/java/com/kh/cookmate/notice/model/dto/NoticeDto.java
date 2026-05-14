package com.kh.cookmate.notice.model.dto;

import java.util.Date;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

public class NoticeDto {

	@Data
	@NoArgsConstructor
	public static class Notice {
		private Long noticeNo;
		private Long userNo;
		private String noticeTitle;
		private String noticeContent;
		private Date noticeModifiedDate;
		private Date startDate;
		private Date endDate;
		private char noticeStatus;
		private char noticeDelete;
		private String typeName;
		private String progressStatus;
	}

	@Data
	@NoArgsConstructor
	@AllArgsConstructor
	public static class NoticePageResponse {
		private List<Notice> notices;
		private int page;
		private int size;
		private int totalCount;
		private int totalPages;
	}

	@Data
	@NoArgsConstructor
	@AllArgsConstructor
	public static class NoticeDetailResponse {
		private Notice notice;
		private Notice previousNotice;
		private Notice nextNotice;
	}
}
