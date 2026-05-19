package com.kh.cookmate.ai.model.dto;

import java.util.List;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class AiDto {

    @Data
    @NoArgsConstructor
    public static class RecipeRecommendRequest {
        private List<String> ingredients;
        private List<String> allergies;
        private String timeFilter;
        private String calorieFilter;
    }

    @Data
    @NoArgsConstructor
    public static class IngredientItem {
        private String ingredientName;
        private String quantity;
        private String unit;
    }

    @Data
    @NoArgsConstructor
    public static class IngredientSet {
        private String setName;
        private List<IngredientItem> ingredients;
    }

    @Data
    @NoArgsConstructor
    public static class CookStep {
        private int step;
        private String cookContent;
    }

    @Data
    @NoArgsConstructor
    public static class RecipeResponse {
        private String id;
        private String title;
        private String introduce;
        private String typeName;
        private String difficult;
        private String cookTime;
        private String calory;
        private List<String> ingredients;
        private List<IngredientSet> ingredientSets;
        private List<CookStep> cookSteps;
        private String tip;
        private String caution;
    }

    @Data
    @NoArgsConstructor
    public static class RecipeListResponse {
        private List<RecipeResponse> recipes;
    }
}
