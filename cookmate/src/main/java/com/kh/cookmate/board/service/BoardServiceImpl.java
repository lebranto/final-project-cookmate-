package com.kh.cookmate.board.service;

import org.springframework.stereotype.Service;

import com.kh.cookmate.board.dao.BoardDao;
import com.kh.cookmate.board.dto.BoardDto.BoardWrite;
import com.kh.cookmate.board.dto.CookStepDto;
import com.kh.cookmate.board.dto.IngredientDto;
import com.kh.cookmate.board.dto.IngredientSetDto;
import com.kh.cookmate.board.model.vo.Board;
import com.kh.cookmate.board.model.vo.CookStep;
import com.kh.cookmate.board.model.vo.Ingredient;
import com.kh.cookmate.board.model.vo.IngredientSet;
import com.kh.cookmate.board.model.vo.Tag;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BoardServiceImpl implements BoardService {
	
	private final BoardDao boardDao;
	
	@Override
	public int insertRecipe(BoardWrite dto) {
		
		// 1. TAG 저장 → typeNo 자동 생성
        Tag tag = new Tag();
        tag.setTypeName(dto.getTypeName());
        tag.setDifficult(dto.getDifficult());
        tag.setCookTime(dto.getCookTime());
        tag.setCalory(dto.getCalory());
        tag.setAi(dto.getAi());
        boardDao.insertTag(tag);

        // 2. BOARD 저장 → boardNo 자동 생성
        Board board = new Board();
        board.setTypeNo(tag.getTypeNo());
        board.setBoardTitle(dto.getBoardTitle());
        board.setIntroduce(dto.getIntroduce());
        board.setImageUrl(dto.getImageUrl());
        board.setUrl(dto.getUrl());
        board.setOpen(dto.getOpen());
        board.setIsApiData('N');    // 사용자 작성은 항상 N
        board.setLikesCount(0);
        board.setBoardDelete('N');
        // TODO: JWT에서 userNo, nickname 추출 (인증 기능 완성 후 추가)
        // board.setUserNo(userNo);
        // board.setNickname(nickname);
        board.setUserNo(dto.getUserNo());
        board.setNickname(dto.getNickname());
        int result = boardDao.insertBoard(board);

        // 3. DTO에 생성된 boardNo 세팅 (Controller에서 Location 헤더 생성용)
        dto.setBoardNo(board.getBoardNo());

        // 4. 재료 묶음 + 재료 저장
        if (dto.getIngredientSets() != null) {
            for (IngredientSetDto.SetWrite setDto : dto.getIngredientSets()) {
                IngredientSet set = new IngredientSet();
                set.setBoardNo(board.getBoardNo());
                boardDao.insertIngredientSet(set);

                if (setDto.getIngredients() != null) {
                    for (IngredientDto.IngWrite ingDto : setDto.getIngredients()) {
                        Ingredient ing = new Ingredient();
                        ing.setSetNo(set.getSetNo());
                        ing.setIngredientName(ingDto.getIngredientName());
                        ing.setQuantity(ingDto.getQuantity());
                        ing.setUnit(ingDto.getUnit());
                        boardDao.insertIngredient(ing);
                    }
                }
            }
        }

        // 5. 조리 단계 저장
        if (dto.getCookSteps() != null) {
            for (CookStepDto.StepWrite stepDto : dto.getCookSteps()) {
                CookStep step = new CookStep();
                step.setBoardNo(board.getBoardNo());
                step.setStep(stepDto.getStep());
                step.setCookContent(stepDto.getCookContent());
                step.setCookImage(stepDto.getCookImage() != null ? stepDto.getCookImage() : "");
                boardDao.insertCookStep(step);
            }
        }

        return result;
    }
	
	
	
	
	
}
