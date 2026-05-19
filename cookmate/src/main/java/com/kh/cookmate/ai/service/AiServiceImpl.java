package com.kh.cookmate.ai.service;


import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import org.springframework.web.server.ResponseStatusException;

import com.kh.cookmate.ai.model.dto.AiDto.RecipeListResponse;
import com.kh.cookmate.ai.model.dto.AiDto.RecipeRecommendRequest;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiServiceImpl implements AiService{
	
	
	private final WebClient.Builder webClientBuilder;

	 @Override
	    public RecipeListResponse recommendRecipes(RecipeRecommendRequest request) {
	        validateRequest(request);
	        
	      try {  
	        RecipeListResponse response = webClientBuilder.build()
	                .post()
	                .uri("http://127.0.0.1:8000/recipe/recommend")
	                .bodyValue(request)
	                .retrieve()
	                .bodyToMono(RecipeListResponse.class)
	                .block();

	        if (response == null || response.getRecipes() == null) {
	            throw new IllegalStateException("AI 추천 결과가 없습니다.");
	        }

	        return response;
	    } catch (WebClientResponseException e) {
	        throw new ResponseStatusException(
	                e.getStatusCode(),
	                e.getResponseBodyAsString(),
	                e
	        		);
	    	}
	 	}

	    
	 	// 잘못된 요청이 들어오면 API를 호출하지 않게 하기 위한 코드
	 	private void validateRequest(RecipeRecommendRequest request) {
	        if (request == null || request.getIngredients() == null || request.getIngredients().isEmpty()) {
	            throw new IllegalArgumentException("재료를 하나 이상 입력해 주세요.");
	        }

	        boolean hasValidIngredient = request.getIngredients().stream()
	                .anyMatch(StringUtils::hasText);

	        if (!hasValidIngredient) {
	            throw new IllegalArgumentException("재료를 하나 이상 입력해 주세요.");
	        }
	    }



}
