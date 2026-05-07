package com.kh.cookmate.board.service;

import com.kh.cookmate.board.dto.BoardDto.BoardWrite;

public interface BoardService{

	int insertRecipe(BoardWrite dto);

}
