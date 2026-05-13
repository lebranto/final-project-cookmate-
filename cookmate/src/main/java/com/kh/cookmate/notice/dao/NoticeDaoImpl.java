package com.kh.cookmate.notice.dao;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.mybatis.spring.SqlSessionTemplate;
import org.springframework.stereotype.Repository;

import com.kh.cookmate.notice.model.dto.NoticeDto.Notice;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Repository
@RequiredArgsConstructor
@Slf4j
public class NoticeDaoImpl implements NoticeDao {

	private final SqlSessionTemplate session;

	@Override
	public List<Notice> selectNoticeList(String keyword, String typeName, String progressStatus, int offset, int size) {
		Map<String, Object> params = new HashMap<>();
		params.put("keyword", keyword);
		params.put("typeName", typeName);
		params.put("progressStatus", progressStatus);
		params.put("offset", offset);
		params.put("size", size);

		return session.selectList("notice.selectNoticeList", params);
	}

	@Override
	public int selectNoticeCount(String keyword, String typeName, String progressStatus) {
		Map<String, Object> params = new HashMap<>();
		params.put("keyword", keyword);
		params.put("typeName", typeName);
		params.put("progressStatus", progressStatus);

		return session.selectOne("notice.selectNoticeCount", params);
	}

	@Override
	public Notice selectNoticeDetail(Long noticeNo) {
		return session.selectOne("notice.selectNoticeDetail", noticeNo);
	}

	@Override
	public Notice selectPreviousNotice(Notice notice) {
		return session.selectOne("notice.selectPreviousNotice", notice);
	}

	@Override
	public Notice selectNextNotice(Notice notice) {
		return session.selectOne("notice.selectNextNotice", notice);
	}
}
