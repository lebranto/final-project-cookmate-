package com.kh.cookmate.admin.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.kh.cookmate.admin.dao.AdminDao;
import com.kh.cookmate.admin.dto.AdminDto;
import com.kh.cookmate.admin.dto.AdminDto.UserSearchDto;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService{
	
	private final AdminDao adminDao;

	@Override
    public AdminDto getDashboard() {
		// DTO는 매번 새로 생성해서 반환해야 안전합니다.
        AdminDto DTO = new AdminDto();
        
        DTO.setTotalUsers(adminDao.countAllUsers());
        DTO.setTotalRecipes(adminDao.countAllRecipes());
        DTO.setPendingReports(adminDao.countPendingReports());
        DTO.setUnansweredInquiries(adminDao.countUnansweredInquiries());

        DTO.setTodayVisitors(adminDao.countTodayVisitors());
        DTO.setTodayLikes(adminDao.countTodayScrap());
        DTO.setTodayComments(adminDao.countTodayComments());

        DTO.setMonthlyBannedUsers(adminDao.countMonthlyBannedUsers());

        DTO.setRecentReports(adminDao.selectRecentReports());
        DTO.setTopRecipes(adminDao.selectTopRecipes());
        DTO.setUnansweredInquiryList(adminDao.selectUnansweredInquiries());

        DTO.setNotice(adminDao.selectNotice());

        return DTO;
    }

	@Override
    public Map<String, Object> getUsers(UserSearchDto condition) {
        // 1. 검색 결과 리스트 조회 (image_a19838.png의 테이블 데이터)
        List<AdminDto.UserPageDto> userList = adminDao.selectUserList(condition);
        
        // 2. 검색 조건에 맞는 전체 게시글 수 조회 (페이지네이션 계산용)
        int totalCount = adminDao.selectUserCount(condition);
        
        // 3. 화면에 필요한 데이터들을 묶어서 반환
        Map<String, Object> response = new HashMap<>();
        response.put("userList", userList);
        response.put("totalCount", totalCount);
        // 필요 시 계산 로직 추가 (예: 시작 페이지, 끝 페이지 등)
        
        return response;
    }
}
