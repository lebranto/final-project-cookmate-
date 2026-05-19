package com.kh.cookmate.ai.service;

import com.kh.cookmate.ai.model.dto.AiDto.RecipeListResponse;
import com.kh.cookmate.ai.model.dto.AiDto.RecipeRecommendRequest;

public interface AiService {

	RecipeListResponse recommendRecipes(RecipeRecommendRequest request);

}
