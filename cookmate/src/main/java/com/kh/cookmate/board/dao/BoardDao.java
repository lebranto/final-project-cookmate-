package com.kh.cookmate.board.dao;

import java.util.List;

import com.kh.cookmate.board.dto.BoardDto.BoardDetail;
import com.kh.cookmate.board.model.vo.Board;
import com.kh.cookmate.board.model.vo.CookStep;
import com.kh.cookmate.board.model.vo.Ingredient;
import com.kh.cookmate.board.model.vo.IngredientSet;
import com.kh.cookmate.board.model.vo.Tag;

public interface BoardDao {

	int insertTag(Tag tag);

	int insertBoard(Board board);

	int insertIngredientSet(IngredientSet set);

	int insertIngredient(Ingredient ing);

	int insertCookStep(CookStep step);

	int countApiRecipes();

	BoardDetail getBoardDetail(int boardNo);

	int insertIngredients(List<Ingredient> ings);

	int insertCookSteps(List<CookStep> steps);

}
