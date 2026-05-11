package com.kh.cookmate.board.model.vo;

import lombok.Data;

@Data
public class CookStep {
	private int boardNo;
    private String cookContent;
    private String cookImage;
    private int step;
}
