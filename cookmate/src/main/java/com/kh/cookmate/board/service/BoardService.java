package com.kh.cookmate.board.service;

import com.kh.cookmate.board.dto.BoardDto.BoardDetail;
import com.kh.cookmate.board.dto.BoardDto.BoardPut;
import com.kh.cookmate.board.dto.BoardDto.BoardWrite;

public interface BoardService{

	int insertRecipe(BoardWrite dto);

	BoardDetail getBoardDetail(int boardNo);

	int updateRecipe(int boardNo, BoardPut dto);

	int deleteRecipe(int boardNo);

}
