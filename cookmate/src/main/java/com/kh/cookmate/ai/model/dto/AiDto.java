package com.kh.cookmate.ai.model.dto;

import java.util.List;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class AiDto {

	// 우리가 물어볼것
    @Data
    @NoArgsConstructor
    public static class RecipeRecommendRequest {
        private List<String> ingredients;
        private String timeFilter;
        private String calorieFilter;
    }
    
    // 추천 레시피 1개 반환 
    @Data
    @NoArgsConstructor
    public static class RecipeResponse {
        private String id;
        private String title;
        private List<String> ingredients;
        private int time;
        private int calories;
        private String description;
        private String method;
    }

    // 추천 레시피 여러개 반환
    @Data
    @NoArgsConstructor
    public static class RecipeListResponse  {
        private List<RecipeResponse> recipes;
    }

		 
}
