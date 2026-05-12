package com.kh.cookmate.admin;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kh.cookmate.admin.dto.AdminDto;
import com.kh.cookmate.admin.dto.AdminDto.UserSearchDto;
import com.kh.cookmate.admin.service.AdminService;
import com.kh.cookmate.admin.service.PublicApiService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/admin")
public class AdminController {
	
	private final AdminService adminService;
	private final PublicApiService publicApiService;
	
	@GetMapping("/dashboard")
	@CrossOrigin(origins = "http://localhost:3000")
	public ResponseEntity<AdminDto> dashboard(){

	    AdminDto dto = adminService.getDashboard();

	    return ResponseEntity.ok(dto);
	}
	
	@GetMapping("/users")
	// UserPageDto -> Map<String, Object> 또는 UserResponseDto로 변경
	public ResponseEntity<Map<String, Object>> getUsers(UserSearchDto condition) {
	    // adminService.getUsers(condition)이 Map을 반환하므로 타입을 맞춰줍니다.
	    return ResponseEntity.ok(adminService.getUsers(condition));
	}
	
	@PostMapping("/fetch-api-recipes")
	public ResponseEntity<?> fetchApiRecipes() {
	    int count = publicApiService.getApiRecipeCount();
	    if (count > 0) {
	        return ResponseEntity.ok("이미 수집됨: " + count + "개");
	    }
	    publicApiService.fetchAndSaveAll();
	    return ResponseEntity.ok("수집 완료");
	}
	
	@PostMapping("/migrate-api-ingredients")
	public ResponseEntity<?> migrateApiIngredients() {
	    publicApiService.migrateIngredients();
	    return ResponseEntity.ok("재료 마이그레이션 완료");
	}	
	
}
