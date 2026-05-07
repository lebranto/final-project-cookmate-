package com.kh.cookmate.controller;

import java.net.URI;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.kh.cookmate.board.dto.BoardDto.BoardWrite;
import com.kh.cookmate.board.service.BoardService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;


@Slf4j
@RequiredArgsConstructor
@RestController
@CrossOrigin(origins = "http://localhost:3000", exposedHeaders = "Location")
public class BoardController {
	
	private final BoardService service;
	
	@PostMapping("/boards")
    public ResponseEntity<?> insertRecipe(
            @RequestBody BoardWrite board) {
		int result = service.insertRecipe(board);
		
		if(result > 0) {
			URI location = URI.create("/boards/"+board.getBoardNo());
			
			//201 created
			return ResponseEntity.created(location).build();
		}else {
			return ResponseEntity.badRequest().build();
		}
    }
}
