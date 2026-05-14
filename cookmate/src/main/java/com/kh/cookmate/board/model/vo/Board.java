package com.kh.cookmate.board.model.vo;

import java.util.Date;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class Board {
	private int boardNo;
    private int userNo;
    private int typeNo;
    private String boardTitle;
    private String nickname;
    private String introduce;
    private Date boardPostdate;
    private String imageUrl;
    private String url;           // 유튜브 URL
    private int likesCount;
    private char boardDelete;     // N: 정상, Y: 삭제
    private char open;            // N: 비공개, Y: 공개
	private char isApiData;
	private String apiRecipeId;
	
}
