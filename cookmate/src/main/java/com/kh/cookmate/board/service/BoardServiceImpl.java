package com.kh.cookmate.board.service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.kh.cookmate.board.dao.BoardDao;
import com.kh.cookmate.board.dto.BoardDto;
import com.kh.cookmate.board.dto.BoardDto.BoardDetail;
import com.kh.cookmate.board.dto.CookStepDto;
import com.kh.cookmate.board.dto.IngredientDto.IngDetail;
import com.kh.cookmate.board.dto.IngredientDto.IngWrite;
import com.kh.cookmate.board.dto.IngredientSetDto.SetWrite;
import com.kh.cookmate.board.model.vo.Board;
import com.kh.cookmate.board.model.vo.CookStep;
import com.kh.cookmate.board.model.vo.Ingredient;
import com.kh.cookmate.board.model.vo.IngredientSet;
import com.kh.cookmate.board.model.vo.Likes;
import com.kh.cookmate.board.model.vo.Tag;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BoardServiceImpl implements BoardService {
	
	private final BoardDao boardDao;
	
	@Override
	@Transactional
	public int insertRecipe(BoardDto.BoardWrite dto) {

        // 1. TAG 저장
        Tag tag = new Tag();
        tag.setTypeName(dto.getTypeName());
        tag.setDifficult(dto.getDifficult());
        tag.setCookTime(dto.getCookTime());
        tag.setCalory(dto.getCalory());
        tag.setAi(dto.getAi());
        boardDao.insertTag(tag);

        // 2. BOARD 저장
        Board board = new Board();
        board.setTypeNo(tag.getTypeNo());
        board.setBoardTitle(dto.getBoardTitle());
        board.setIntroduce(dto.getIntroduce());
        board.setImageUrl(dto.getImageUrl());
        board.setUrl(dto.getUrl());
        board.setOpen(dto.getOpen());
        board.setIsApiData('N');
        board.setLikesCount(0);
        board.setBoardDelete('N');
        board.setUserNo(dto.getUserNo());
        board.setNickname(dto.getNickname());
        int result = boardDao.insertBoard(board);
        dto.setBoardNo(board.getBoardNo());

        // 3. 재료 묶음 + 재료 저장
        if (dto.getIngredientSets() != null) {
            for (SetWrite setDto : dto.getIngredientSets()) {
                // SET_NO 필요하므로 묶음은 단건 INSERT
                IngredientSet set = new IngredientSet();
                set.setBoardNo(board.getBoardNo());
                boardDao.insertIngredientSet(set);

                // 재료는 한번에 INSERT
                if (setDto.getIngredients() != null && !setDto.getIngredients().isEmpty()) {
                    List<Ingredient> ings = setDto.getIngredients().stream()
                        .map(ingDto -> {
                            Ingredient ing = new Ingredient();
                            ing.setSetNo(set.getSetNo());
                            ing.setIngredientName(ingDto.getIngredientName());
                            ing.setQuantity(ingDto.getQuantity());
                            ing.setUnit(ingDto.getUnit());
                            return ing;
                        }).collect(Collectors.toList());
                    boardDao.insertIngredients(ings);
                }
            }
        }

        // 4. 조리 단계 한번에 저장
        if (dto.getCookSteps() != null && !dto.getCookSteps().isEmpty()) {
            List<CookStep> steps = dto.getCookSteps().stream()
                .map(stepDto -> {
                    CookStep step = new CookStep();
                    step.setBoardNo(board.getBoardNo());
                    step.setStep(stepDto.getStep());
                    step.setCookContent(stepDto.getCookContent());
                    step.setCookImage(stepDto.getCookImage() != null ? stepDto.getCookImage() : "");
                    return step;
                }).collect(Collectors.toList());
            boardDao.insertCookSteps(steps);
        }

        return result;
    }                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             

	@Override
    public BoardDetail getBoardDetail(int boardNo) {
        return boardDao.getBoardDetail(boardNo);
    }

	//레시피 수정 (부분 수정)
    @Override
    @Transactional
    public int updateRecipe(int boardNo, BoardDto.BoardPut dto) {

        // 1. BOARD 기본 정보 수정
        Board board = new Board();
        board.setBoardNo(boardNo);
        board.setBoardTitle(dto.getBoardTitle());
        board.setIntroduce(dto.getIntroduce());
        board.setImageUrl(dto.getImageUrl());
        board.setUrl(dto.getUrl());
        board.setOpen(dto.getOpen());
        boardDao.updateBoard(board);

        // 2. TAG 수정
        if (dto.getTypeName() != null || dto.getDifficult() != null
                || dto.getCookTime() != null || dto.getCalory() != null) {
            Tag tag = new Tag();
            tag.setTypeNo(dto.getTypeNo());
            tag.setTypeName(dto.getTypeName());
            tag.setDifficult(dto.getDifficult());
            tag.setCookTime(dto.getCookTime());
            tag.setCalory(dto.getCalory());
            boardDao.updateTag(tag);
        }

     // 3. 재료 묶음 분류 후 처리
        if (dto.getIngredientSets() != null) {
            List<Ingredient> toInsert = new ArrayList<>();
            List<IngDetail> toUpdate = new ArrayList<>();
            List<Integer> toDelete = new ArrayList<>();

            for (SetWrite setDto : dto.getIngredientSets()) {

                // 묶음 삭제
                if (setDto.isDeleted()) {
                    boardDao.deleteIngredientsBySetNo(setDto.getSetNo()); // 재료 먼저 삭제
                    boardDao.deleteIngredientSet(setDto.getSetNo());      // 묶음 삭제
                    continue;
                }

                // 묶음 신규 추가
                if (setDto.isNew()) {
                    IngredientSet newSet = new IngredientSet();
                    newSet.setBoardNo(boardNo);
                    boardDao.insertIngredientSet(newSet); 

                    // 생성된 setNo로 재료 INSERT
                    if (setDto.getIngredients() != null && !setDto.getIngredients().isEmpty()) {
                        List<Ingredient> ings = setDto.getIngredients().stream()
                            .filter(ingDto -> !ingDto.isDeleted()) 
                            .map(ingDto -> {
                                Ingredient ing = new Ingredient();
                                ing.setSetNo(newSet.getSetNo()); 
                                ing.setIngredientName(ingDto.getIngredientName());
                                ing.setQuantity(ingDto.getQuantity());
                                ing.setUnit(ingDto.getUnit());
                                return ing;
                            }).collect(Collectors.toList());

                        if (!ings.isEmpty()) boardDao.insertIngredients(ings);
                    }
                    continue; 
                }

                // 기존 묶음 안의 재료 부분 수정
                if (setDto.getIngredients() == null) continue;
                for (IngWrite ingDto : setDto.getIngredients()) {
                    if (ingDto.isDeleted()) {
                        toDelete.add(ingDto.getIngredientNo());
                    } else if (ingDto.getIngredientNo() == 0) {
                        Ingredient ing = new Ingredient();
                        ing.setSetNo(setDto.getSetNo());
                        ing.setIngredientName(ingDto.getIngredientName());
                        ing.setQuantity(ingDto.getQuantity());
                        ing.setUnit(ingDto.getUnit());
                        toInsert.add(ing);
                    } else {
                        IngDetail detail = new IngDetail();
                        detail.setIngredientNo(ingDto.getIngredientNo());
                        detail.setIngredientName(ingDto.getIngredientName());
                        detail.setQuantity(ingDto.getQuantity());
                        detail.setUnit(ingDto.getUnit());
                        toUpdate.add(detail);
                    }
                }
            }

            if (!toDelete.isEmpty()) boardDao.deleteIngredients(toDelete);
            if (!toUpdate.isEmpty()) boardDao.updateIngredients(toUpdate);
            if (!toInsert.isEmpty()) boardDao.insertIngredients(toInsert);
        }

        // 4. 조리단계 분류 후 한번에 처리
        if (dto.getCookSteps() != null) {
            List<CookStep> toInsert = new ArrayList<>();
            List<CookStep> toUpdate = new ArrayList<>();
            List<CookStep> toDelete = new ArrayList<>();

            for (CookStepDto.StepWrite stepDto : dto.getCookSteps()) {
                CookStep step = new CookStep();
                step.setBoardNo(boardNo);
                step.setStep(stepDto.getStep());
                step.setCookContent(stepDto.getCookContent());
                step.setCookImage(stepDto.getCookImage() != null ? stepDto.getCookImage() : "");

                if (stepDto.isDeleted())    toDelete.add(step);
                else if (stepDto.isNew())   toInsert.add(step);
                else                        toUpdate.add(step);
            }

            if (!toDelete.isEmpty()) boardDao.deleteCookSteps(toDelete);
            if (!toUpdate.isEmpty()) boardDao.updateCookSteps(toUpdate);
            if (!toInsert.isEmpty()) boardDao.insertCookSteps(toInsert);
        }

        return 1;
    }

	@Override
	public int deleteRecipe(int boardNo) {
		return boardDao.deleteBoard(boardNo);
	}

	@Override
	@Transactional
	public int toggleLikes(int boardNo, int userNo) {

	    // 1. 작성자 본인 확인
	    int writerNo = boardDao.selectBoardUserNo(boardNo);
	    if (writerNo == userNo) {
	        return -1; // 본인 게시글
	    }

	    Likes likes = new Likes();
	    likes.setBoardNo(boardNo);
	    likes.setUserNo(userNo);

	    // 2. 이미 좋아요 눌렀는지 확인
	    int count = boardDao.selectLikesCount(likes);

	    if (count > 0) {
	        // 좋아요 취소
	        boardDao.deleteLikes(likes);
	        boardDao.decreaseLikes(boardNo);
	        return 0; // 취소
	    } else {
	        // 좋아요 추가
	        boardDao.insertLikes(likes);
	        boardDao.increaseLikes(boardNo);
	        return 1; // 추가
	    }
	}

	
	
	
	
	
	
}
