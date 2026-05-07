package com.kh.cookmate.board.model.vo;

import lombok.Data;

@Data
public class Tag {
    private int typeNo;
    private String typeName;    // 한식, 중식, 일식, 양식, 샐러드, 디저트
    private String difficult;   // 쉬움, 보통, 어려움
    private String cookTime;    // 15분 이내, 30분 이내, 1시간 이내, 1시간 이상
    private String calory;      // 저칼로리, 보통, 고칼로리
    private char ai;            // Y: AI추천 레시피, N: 일반
}
