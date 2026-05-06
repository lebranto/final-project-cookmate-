package com.kh.cookmate.admin.service;

import java.util.Map;

import com.kh.cookmate.admin.dto.AdminDto;
import com.kh.cookmate.admin.dto.AdminDto.UserSearchDto;

public interface AdminService {
	
	AdminDto getDashboard();

	Map<String, Object> getUsers(UserSearchDto condition);
	
	//List<usersDto> getUsers();
}
