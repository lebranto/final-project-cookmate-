package com.kh.cookmate.member.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecipeDto {
    private long boardNo;        // BIGINT 매핑
    private String title;        // BOARD_TITLE
    private String category;     // TAG 테이블과 조인된 TYPE_NAME
    private String thumbClass;   // UI 스타일용 (DB 컬럼 아님)
    private String cookTime;     // TAG 테이블의 COOK_TIME
    private char open;           // OPEN ('Y'/'N')
    private int likesCount;      // LIKES_COUNT
    private String authorNickname; // 작성자 닉네임
    private String boardPostdate; // 작성일
}