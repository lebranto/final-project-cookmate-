package com.kh.cookmate.board.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

public class IngredientSetDto {

    @Data 
    @NoArgsConstructor
    public static class SetWrite {
        private int setNo;          // 수정/삭제 식별용
        private String setName;
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