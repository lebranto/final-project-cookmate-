package com.kh.cookmate.notice.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.kh.cookmate.notice.dao.NoticeDao;
import com.kh.cookmate.notice.model.dto.NoticeDto.Notice;
import com.kh.cookmate.notice.model.dto.NoticeDto.NoticeDetailResponse;
import com.kh.cookmate.notice.model.dto.NoticeDto.NoticePageResponse;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class NoticeServiceImpl implements NoticeService {

	private final NoticeDao dao;

	@Override
	public NoticePageResponse selectNoticeList(String keyword, String typeName, String progressStatus, int page, int size) {
		int safePage = Math.max(page, 1);
		int safeSize = Math.min(Math.max(size, 1), 50);
		int offset = (safePage - 1) * safeSize;
		String normalizedKeyword = keyword == null ? "" : keyword.trim();
		String normalizedTypeName = typeName == null ? "" : typeName.trim();
		String normalizedProgressStatus = progressStatus == null ? "" : progressStatus.trim();

		int totalCount = dao.selectNoticeCount(normalizedKeyword, normalizedTypeName, normalizedProgressStatus);
		int totalPages = (int) Math.ceil((double) totalCount / safeSize);
		List<Notice> notices = dao.selectNoticeList(
			normalizedKeyword,
			normalizedTypeName,
			normalizedProgressStatus,
			offset,
			safeSize
		);

		return new NoticePageResponse(notices, safePage, safeSize, totalCount, totalPages);
	}

	@Override
	public NoticeDetailResponse selectNoticeDetail(Long noticeNo) {
		Notice notice = dao.selectNoticeDetail(noticeNo);

		if (notice == null) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "공지사항을 찾을 수 없습니다.");
		}

		Notice previousNotice = dao.selectPreviousNotice(notice);
		Notice nextNotice = dao.selectNextNotice(notice);

		return new NoticeDetailResponse(notice, previousNotice, nextNotice);
	}
}
