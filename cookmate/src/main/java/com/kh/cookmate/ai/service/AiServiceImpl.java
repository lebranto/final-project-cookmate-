package com.kh.cookmate.ai.service;

import org.springframework.beans.factory.annotation.Value;
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
public class AiServiceImpl implements AiService {

    private final WebClient.Builder webClientBuilder;

    @Value("${ai.recipe-api-url}")
    private String aiRecipeApiUrl;

    @Override
    public RecipeListResponse recommendRecipes(RecipeRecommendRequest request) {
        validateRequest(request);

        try {
            RecipeListResponse response = webClientBuilder.build()
                    .post()
                    .uri(aiRecipeApiUrl)
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
