package com.kh.cookmate.board.dao;

import org.mybatis.spring.SqlSessionTemplate;
import org.springframework.stereotype.Repository;

import com.kh.cookmate.board.model.vo.Board;
import com.kh.cookmate.board.model.vo.CookStep;
import com.kh.cookmate.board.model.vo.Ingredient;
import com.kh.cookmate.board.model.vo.IngredientSet;
import com.kh.cookmate.board.model.vo.Tag;

import lombok.RequiredArgsConstructor;

@Repository
@RequiredArgsConstructor
public class BoardDaoImpl implements BoardDao{
	private final SqlSessionTemplate session;
	@Override
	public int insertTag(Tag tag) {
		return session.insert("boardmapper.insertTag", tag);
	}

	@Override
	public int insertBoard(Board board) {
		return session.insert("boardmapper.insertBoard", board);
	}

	@Override
	public int insertIngredientSet(IngredientSet set) {
		return session.insert("boardmapper.insertIngredientSet", set);
	}

	@Override
	public int insertIngredient(Ingredient ing) {
		return session.insert("boardmapper.insertIngredient", ing);
	}

	@Override
	public int insertCookStep(CookStep step) {
		return session.insert("boardmapper.insertCookStep", step);
	}
	
	@Override
	public int countApiRecipes() {
        return session.selectOne("boardmapper.countApiRecipes");
    }
	
}
