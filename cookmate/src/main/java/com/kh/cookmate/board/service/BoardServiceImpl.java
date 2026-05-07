package com.kh.cookmate.board.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.kh.cookmate.board.dao.BoardDao;
import com.kh.cookmate.board.dto.BoardDto;
import com.kh.cookmate.board.dto.BoardDto.BoardDetail;
import com.kh.cookmate.board.dto.IngredientSetDto.SetWrite;
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
	
	
	
	
	
}
