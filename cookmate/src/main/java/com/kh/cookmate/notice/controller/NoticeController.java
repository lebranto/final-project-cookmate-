package com.kh.cookmate.notice.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.kh.cookmate.notice.model.dto.NoticeDto.NoticeDetailResponse;
import com.kh.cookmate.notice.model.dto.NoticeDto.NoticePageResponse;
import com.kh.cookmate.notice.service.NoticeService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/notice")
@RequiredArgsConstructor
@Slf4j
public class NoticeController {
	
	private final NoticeService service;

	@GetMapping
	public NoticePageResponse selectNoticeList(
		@RequestParam(required = false, defaultValue = "") String keyword,
		@RequestParam(required = false, defaultValue = "") String typeName,
		@RequestParam(required = false, defaultValue = "") String progressStatus,
		@RequestParam(required = false, defaultValue = "1") int page,
		@RequestParam(required = false, defaultValue = "10") int size
	) {
		return service.selectNoticeList(keyword, typeName, progressStatus, page, size);
	}

	@GetMapping("/{noticeNo}")
	public NoticeDetailResponse selectNoticeDetail(@PathVariable Long noticeNo) {
		return service.selectNoticeDetail(noticeNo);
	}
}
