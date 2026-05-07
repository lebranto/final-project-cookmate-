package com.kh.cookmate.board.dto;

import java.util.List;

import lombok.Data;
import lombok.NoArgsConstructor;

public class IngredientSetDto {
	@Data
    @NoArgsConstructor
    public static class SetWrite {
        private String setName;                         // 주재료, 양념 등
        private List<IngredientDto.IngWrite> ingredients;
    }

    @Data
    @NoArgsConstructor
    public static class SetDetail {
        private int setNo;
        private String setName;
        private List<IngredientDto.IngDetail> ingredients;
    }
}
