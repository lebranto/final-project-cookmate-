package com.kh.cookmate.board.dao;

import java.util.List;
import java.util.Map;

import org.mybatis.spring.SqlSessionTemplate;
import org.springframework.stereotype.Repository;

import com.kh.cookmate.board.dto.BoardDto.BoardDetail;
import com.kh.cookmate.board.dto.BoardDto.BoardSearchRequest;
import com.kh.cookmate.board.dto.BoardDto.BoardSearchResult;
import com.kh.cookmate.board.dto.CommentDto.CommentDetail;
import com.kh.cookmate.board.dto.IngredientDto;
import com.kh.cookmate.board.model.vo.Board;
import com.kh.cookmate.board.model.vo.Comment;
import com.kh.cookmate.board.model.vo.CookStep;
import com.kh.cookmate.board.model.vo.Ingredient;
import com.kh.cookmate.board.model.vo.IngredientSet;
import com.kh.cookmate.board.model.vo.Likes;
import com.kh.cookmate.board.model.vo.Scrap;
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
	public String selectNicknameByUserNo(int userNo) {
		return session.selectOne("boardmapper.selectNicknameByUserNo", userNo);
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

	@Override
	public int countApiRecipeDuplicate(Map<String, Object> params) {
		Integer count = session.selectOne("boardmapper.countApiRecipeDuplicate", params);
		return count == null ? 0 : count;
	}

	@Override
	public BoardDetail getBoardDetail(int boardNo) {
		return session.selectOne("boardmapper.getBoardDetail", boardNo);
	}

	@Override
	public List<BoardSearchResult> searchBoards(BoardSearchRequest request) {
		return session.selectList("boardmapper.searchBoards", request);
	}

	@Override
	public int countSearchBoards(BoardSearchRequest request) {
		return session.selectOne("boardmapper.countSearchBoards", request);
	}

	@Override
	public List<BoardSearchResult> selectWeeklyPopularBoards(int size) {
		return session.selectList("boardmapper.selectWeeklyPopularBoards", size);
	}

	@Override public int insertIngredients(List<Ingredient> list) {
        return session.insert("boardmapper.insertIngredients", list);
    }

	@Override public int insertCookSteps(List<CookStep> list) {
        return session.insert("boardmapper.insertCookSteps", list);
    }

	 @Override 
	 public int updateBoard(Board board) {
        return session.update("boardmapper.updateBoard", board);
    }

	 @Override 
	 public int updateTag(Tag tag) {
        return session.update("boardmapper.updateTag", tag);
    }

	 @Override 
	 public int deleteIngredients(List<Integer> list) {
        return session.delete("boardmapper.deleteIngredients", list);
    }

	 @Override 
	 public int updateIngredients(List<IngredientDto.IngDetail> list) {
        return session.update("boardmapper.updateIngredients", list);
    }

	 @Override
	 public int deleteCookSteps(List<CookStep> list) {
        return session.delete("boardmapper.deleteCookSteps", list);
    }

	@Override
	public int updateCookSteps(List<CookStep> list) {
		return session.update("boardmapper.updateCookSteps", list);
	}

	@Override
	public int deleteIngredientSet(int setNo) {
		return session.delete("boardmapper.deleteIngredientSet", setNo);
	}

	@Override
	public int deleteIngredientsBySetNo(int setNo) {
		return session.delete("boardmapper.deleteIngredientsBySetNo", setNo);
	}

	@Override
	public int deleteBoard(int boardNo) {
		return session.delete("boardmapper.deleteBoard", boardNo);
	}
	
	
	// 좋아요
	@Override 
	public int selectLikesCount(Likes likes) {
	    return session.selectOne("boardmapper.selectLikesCount", likes);
	}
	@Override 
	public int selectBoardUserNo(int boardNo) {
	    return session.selectOne("boardmapper.selectBoardUserNo", boardNo);
	}
	@Override
	public char selectBoardIsApiData(int boardNo) {
	    return session.selectOne("boardmapper.selectBoardIsApiData", boardNo);
	}
	@Override 
	public int insertLikes(Likes likes) {
	    return session.insert("boardmapper.insertLikes", likes);
	}
	@Override 
	public int deleteLikes(Likes likes) {
	    return session.delete("boardmapper.deleteLikes", likes);
	}
	@Override 
	public int increaseLikes(int boardNo) {
	    return session.update("boardmapper.increaseLikes", boardNo);
	}
	@Override 
	public int decreaseLikes(int boardNo) {
	    return session.update("boardmapper.decreaseLikes", boardNo);
	}
	
	// 스크랩
	@Override 
	public int insertScrap(Scrap scrap) {
        return session.insert("boardmapper.insertScrap", scrap);
    }
    @Override 
    public int deleteScrap(Scrap scrap) {
        return session.delete("boardmapper.deleteScrap", scrap);
    }
    @Override 
    public int selectScrapCount(Scrap scrap) {
        return session.selectOne("boardmapper.selectScrapCount", scrap);
    }
    
    // 댓글
    @Override 
    public int insertComment(Comment comment) {
        return session.insert("boardmapper.insertComment", comment);
    }

    @Override
    public List<CommentDetail> selectCommentList(int boardNo) {
        return session.selectList("boardmapper.selectCommentList", boardNo);
    }

	@Override
	public int deleteComment(int commentNo) {
		return session.update("boardmapper.deleteComment", commentNo);
	}

	@Override
	public int selectCommentUserNo(int commentNo) {
		Integer userNo = session.selectOne("boardmapper.selectCommentUserNo", commentNo);
		return userNo == null ? 0 : userNo;
	}

	@Override
	public int selectCommentBoardNo(int commentNo) {
		Integer boardNo = session.selectOne("boardmapper.selectCommentBoardNo", commentNo);
		return boardNo == null ? 0 : boardNo;
	}

	@Override
	public int selectCommentReportCount(Map<String, Object> params) {
		Integer count = session.selectOne("boardmapper.selectCommentReportCount", params);
		return count == null ? 0 : count;
	}

	@Override
	public int insertCommentReport(Map<String, Object> params) {
		return session.insert("boardmapper.insertCommentReport", params);
	}

	@Override
	public int insertCommentReportDetail(Map<String, Object> params) {
		return session.insert("boardmapper.insertCommentReportDetail", params);
	}

	@Override
	public List<Map<String, Object>> selectApiBoards() {
	    return session.selectList("boardmapper.selectApiBoards");
	}

	@Override
	public int clearIntroduce(int boardNo) {
	    return session.update("boardmapper.clearIntroduce", boardNo);
	}
    
	//알림
	@Override
	public char selectBoardOpen(int boardNo) {
	    Character open = session.selectOne("boardmapper.selectBoardOpen", boardNo);
	    return open == null ? 'N' : open;
	}
	
  
}
