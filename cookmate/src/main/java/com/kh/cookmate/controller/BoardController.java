package com.kh.cookmate.controller;

import java.net.URI;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.kh.cookmate.board.dto.BoardDto;
import com.kh.cookmate.board.dto.BoardDto.BoardPut;
import com.kh.cookmate.board.dto.BoardDto.BoardWrite;
import com.kh.cookmate.board.dto.CommentDto.CommentWrite;
import com.kh.cookmate.board.service.BoardService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
@RestController
@CrossOrigin(origins = "http://localhost:3000", exposedHeaders = "Location")
public class BoardController {

    private final BoardService service;

    // 레시피 등록
    @PostMapping("/boards")
    public ResponseEntity<?> insertRecipe(@RequestBody BoardWrite dto) {
        int result = service.insertRecipe(dto);
        if (result > 0) {
            URI location = URI.create("/boards/" + dto.getBoardNo());
            return ResponseEntity.created(location).build();
        }
        return ResponseEntity.badRequest().build();
    }

    // 레시피 상세 조회
    @GetMapping("/boards/{boardNo}")
    public ResponseEntity<?> getBoardDetail(@PathVariable int boardNo) {
        BoardDto.BoardDetail detail = service.getBoardDetail(boardNo);
        if (detail == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(detail);
    }
    
 // 레시피 수정
    @PutMapping("/boards/{boardNo}")
    public ResponseEntity<?> updateRecipe(
            @PathVariable int boardNo,
            @RequestBody BoardPut dto) {
        int result = service.updateRecipe(boardNo, dto);
        if (result > 0) return ResponseEntity.ok().build();
        return ResponseEntity.badRequest().build();
    }
    
    // 레시피 삭제
    @DeleteMapping("/boards/{boardNo}")
    public ResponseEntity<?> deleteRecipe(@PathVariable int boardNo) {
        int result = service.deleteRecipe(boardNo);
        if (result > 0) return ResponseEntity.ok().build();
        return ResponseEntity.badRequest().build();
    }
    
    // 좋아요 수 증가
    @PostMapping("/boards/{boardNo}/likes")
    public ResponseEntity<?> toggleLikes(
            @PathVariable int boardNo,
            @RequestParam int userNo) { // TODO: JWT 완성 후 토큰에서 추출

        int result = service.toggleLikes(boardNo, userNo);

        if (result == -1) {
            return ResponseEntity.badRequest().body("본인 게시글은 좋아요 불가");
        } else if (result == 1) {
            return ResponseEntity.ok("좋아요 추가");
        } else {
            return ResponseEntity.ok("좋아요 취소");
        }
    }
    
    // 스크랩
    @PostMapping("/boards/{boardNo}/scrap")
    public ResponseEntity<?> toggleScrap(
            @PathVariable int boardNo,
            @RequestParam int userNo) {

        int result = service.toggleScrap(boardNo, userNo);

        if (result == -1) {
        	return ResponseEntity.badRequest().body("본인 게시글은 스크랩 불가");
        }else if (result == 1) {
        	return ResponseEntity.ok("스크랩 추가");
        }else {
        	return ResponseEntity.ok("스크랩 취소");
        }
    }
    
    // 댓글
    // 댓글 등록
    @PostMapping("/boards/{boardNo}/comments")
    public ResponseEntity<?> insertComment(
            @PathVariable int boardNo,
            @RequestBody CommentWrite dto) {
        dto.setBoardNo(boardNo);
        int result = service.insertComment(dto);
        if (result > 0) return ResponseEntity.ok().build();
        return ResponseEntity.badRequest().build();
    }
    
    // 댓글 목록 조회
    @GetMapping("/boards/{boardNo}/comments")
    public ResponseEntity<?> getCommentList(@PathVariable int boardNo) {
        return ResponseEntity.ok(service.getCommentList(boardNo));
    }
    
 // 댓글 삭제
    @DeleteMapping("/comments/{commentNo}")
    public ResponseEntity<?> deleteComment(@PathVariable int commentNo) {
        int result = service.deleteComment(commentNo);
        if (result > 0) return ResponseEntity.ok().build();
        return ResponseEntity.badRequest().build();
    }
}