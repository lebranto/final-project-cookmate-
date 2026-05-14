package com.kh.cookmate.notice.service;

import com.kh.cookmate.notice.model.dto.NoticeDto.NoticePageResponse;
import com.kh.cookmate.notice.model.dto.NoticeDto.NoticeDetailResponse;

public interface NoticeService {

	NoticePageResponse selectNoticeList(String keyword, String typeName, String progressStatus, int page, int size);

	NoticeDetailResponse selectNoticeDetail(Long noticeNo);
}
