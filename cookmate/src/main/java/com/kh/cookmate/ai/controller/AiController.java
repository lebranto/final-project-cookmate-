package com.kh.cookmate.ai.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kh.cookmate.ai.model.dto.AiDto.RecipeListResponse;
import com.kh.cookmate.ai.model.dto.AiDto.RecipeRecommendRequest;
import com.kh.cookmate.ai.service.AiService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/ai")
@RequiredArgsConstructor
@Slf4j
public class AiController {
	
	private final AiService service;
	
	@PostMapping("/recipes")
	public ResponseEntity<RecipeListResponse> recommendRecipes(
			@RequestBody RecipeRecommendRequest request
			){
		

		 RecipeListResponse response = service.recommendRecipes(request);
		 
		 return ResponseEntity.ok(response);
		
		
	}
	

}
