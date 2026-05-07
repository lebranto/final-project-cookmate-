package com.kh.cookmate.board.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

public class IngredientDto {
	@Data
    @NoArgsConstructor
    public static class IngWrite {
        private String ingredientName;
        private String quantity;
        private String unit;
    }

    @Data
    @NoArgsConstructor
    public static class IngDetail {
        private int ingredientNo;
        private String ingredientName;
        private String quantity;
        private String unit;
    }
}
