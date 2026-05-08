package com.kh.cookmate.board.dto;

import java.util.List;

import lombok.Data;
import lombok.NoArgsConstructor;

public class BoardDto {
	// 레시피 작성
    @Data
    @NoArgsConstructor
    public static class BoardWrite {
        // BOARD
    	private int boardNo;        // 응답용
        private int userNo;         // TODO: JWT 완성 후 토큰에서 추출
        private String nickname;    // TODO: JWT 완성 후 DB에서 조회 
        private String boardTitle;
        private String introduce;
        private String imageUrl;
        private String url;         // 유튜브 URL
        private char open;          // Y: 공개, N: 비공개
        private char isApiData;     // ← 추가 Y: 공식API, N: 사용자
        
        // TAG
        private String typeName;    // 한식/중식/일식/양식/샐러드/디저트
        private String difficult;   // 쉬움/보통/어려움
        private String cookTime;    // 15분이내/30분이내/1시간이내/1시간이상
        private String calory;      // 저칼로리/보통/고칼로리
        private char ai;            // Y: AI추천, N: 일반

        // 재료 묶음
        private List<IngredientSetDto.SetWrite> ingredientSets;

        // 조리 단계
        private List<CookStepDto.StepWrite> cookSteps;

		
    }
    
 // 레시피 상세
    @Data @NoArgsConstructor
    public static class BoardDetail {
        private int boardNo;
        private int userNo;
        private int typeNo;         // TAG 수정용
        private String boardTitle;
        private String introduce;
        private String imageUrl;
        private String url;
        private char open;
        private int likesCount;
        private String nickname;
        private String typeName;
        private String difficult;
        private String cookTime;
        private String calory;
        private char ai;
        private List<IngredientSetDto.SetDetail> ingredientSets;
        private List<CookStepDto.StepDetail> cookSteps;
    }
    
    // 레시피 수정
    @Data @NoArgsConstructor
    public static class BoardPut {
        private int typeNo;         // TAG 수정용
        private String boardTitle;
        private String introduce;
        private String imageUrl;
        private String url;
        private char open;
        private String typeName;
        private String difficult;
        private String cookTime;
        private String calory;
        private List<IngredientSetDto.SetWrite> ingredientSets;
        private List<CookStepDto.StepWrite> cookSteps;
    }
    
    
}
