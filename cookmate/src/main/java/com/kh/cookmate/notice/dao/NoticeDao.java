package com.kh.cookmate.notice.dao;

import java.util.List;

import com.kh.cookmate.notice.model.dto.NoticeDto.Notice;

public interface NoticeDao {

	List<Notice> selectNoticeList(String keyword, String typeName, String progressStatus, int offset, int size);

	int selectNoticeCount(String keyword, String typeName, String progressStatus);

	Notice selectNoticeDetail(Long noticeNo);

	Notice selectPreviousNotice(Notice notice);

	Notice selectNextNotice(Notice notice);
}
