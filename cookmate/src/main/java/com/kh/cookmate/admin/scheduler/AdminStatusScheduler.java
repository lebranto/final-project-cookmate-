package com.kh.cookmate.admin.scheduler;

import java.util.Map;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.kh.cookmate.admin.service.AdminService;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class AdminStatusScheduler {

	// "1분마다 만료된 정지/공지 상태를 자동으로 해제하는 배치 작업"
	// 유저의 정지기간 자동 해제 (1분 주기)
	// 공지사항의 종료기간에 맞춰 자동 종료 (1분 주기)
	
	private final AdminService adminService;

	@PostConstruct
	public void expireOnStartup() {
		expireTimedStatuses();
	}

	@Scheduled(fixedDelay = 60_000)
	public void expireTimedStatuses() {
		Map<String, Integer> result = adminService.expireTimedStatuses();

		int changed = result.values().stream()
				.mapToInt(Integer::intValue)
				.sum();

		if (changed > 0) {
			log.info("기간 만료 상태 자동 정리 완료: {}", result);
		}
	}
}
