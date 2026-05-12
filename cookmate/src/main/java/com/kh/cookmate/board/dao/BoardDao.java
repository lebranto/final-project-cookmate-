package com.kh.cookmate.board.dao;

import java.util.List;
import java.util.Map;

import com.kh.cookmate.board.dto.BoardDto.BoardDetail;
import com.kh.cookmate.board.dto.BoardDto.BoardSearchRequest;
import com.kh.cookmate.board.dto.BoardDto.BoardSearchResult;
import com.kh.cookmate.board.dto.CommentDto.CommentDetail;
import com.kh.cookmate.board.dto.IngredientDto.IngDetail;
import com.kh.cookmate.board.model.vo.Board;
import com.kh.cookmate.board.model.vo.Comment;
import com.kh.cookmate.board.model.vo.CookStep;
import com.kh.cookmate.board.model.vo.Ingredient;
import com.kh.cookmate.board.model.vo.IngredientSet;
import com.kh.cookmate.board.model.vo.Likes;
import com.kh.cookmate.board.model.vo.Scrap;
import com.kh.cookmate.board.model.vo.Tag;

public interface BoardDao {

	int insertTag(Tag tag);

	int insertBoard(Board board);

	String selectNicknameByUserNo(int userNo);

	int insertIngredientSet(IngredientSet set);

	int insertIngredient(Ingredient ing);

	int insertCookStep(CookStep step);

	int countApiRecipes();

	BoardDetail getBoardDetail(int boardNo);

	List<BoardSearchResult> searchBoards(BoardSearchRequest request);

	int countSearchBoards(BoardSearchRequest request);

	int insertIngredients(List<Ingredient> ings);

	int insertCookSteps(List<CookStep> steps);

	int updateBoard(Board board);

	int updateTag(Tag tag);

	int deleteIngredients(List<Integer> toDelete);

	int updateIngredients(List<IngDetail> toUpdate);

	int deleteCookSteps(List<CookStep> toDelete);

	int updateCookSteps(List<CookStep> toUpdate);

	int deleteIngredientSet(int setNo);

	int deleteIngredientsBySetNo(int setNo);

	int deleteBoard(int boardNo);

	// 좋아요
	int selectLikesCount(Likes likes);
	int selectBoardUserNo(int boardNo);
	char selectBoardIsApiData(int boardNo);
	int insertLikes(Likes likes);
	int deleteLikes(Likes likes);
	int increaseLikes(int boardNo);
	int decreaseLikes(int boardNo);
	
	// 스크랩
	int selectScrapCount(Scrap scrap);
	int deleteScrap(Scrap scrap);
	int insertScrap(Scrap scrap);
	
	// 댓글
	int insertComment(Comment comment);
	List<CommentDetail> selectCommentList(int boardNo);
	int deleteComment(int commentNo);

	List<Map<String, Object>> selectApiBoards();
	int clearIntroduce(int boardNo);
	


}
