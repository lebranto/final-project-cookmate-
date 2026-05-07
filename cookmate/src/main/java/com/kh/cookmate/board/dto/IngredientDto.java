package com.kh.cookmate.board.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

public class IngredientDto {

    @Data @NoArgsConstructor
    public static class IngWrite {
        private int ingredientNo;   // 신규면 0
        private int setNo;          // 어느 묶음인지
        private String ingredientName;
        private String quantity;
        private String unit;
        private boolean deleted;    // 삭제 플래그
    }

    @Data @NoArgsConstructor
    public static class IngDetail {
        private int ingredientNo;
        private String ingredientName;
        private String quantity;
        private String unit;
    }
}