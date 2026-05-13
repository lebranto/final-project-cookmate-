package com.kh.cookmate.controller;

import java.net.URI;
import java.util.Map;

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
import com.kh.cookmate.board.dto.BoardDto.BoardSearchRequest;
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

    @PostMapping("/boards")
    public ResponseEntity<?> insertRecipe(@RequestBody BoardWrite dto) {
        int result = service.insertRecipe(dto);
        if (result > 0) {
            URI location = URI.create("/boards/" + dto.getBoardNo());
            return ResponseEntity.created(location).build();
        }
        return ResponseEntity.badRequest().body("레시피 등록에 실패했습니다.");
    }

    @GetMapping("/boards/{boardNo}")
    public ResponseEntity<?> getBoardDetail(@PathVariable int boardNo) {
        BoardDto.BoardDetail detail = service.getBoardDetail(boardNo);
        if (detail == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(detail);
    }

    @GetMapping("/boards/search")
    public ResponseEntity<?> searchBoards(
            @RequestParam(defaultValue = "user") String source,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String cookTime,
            @RequestParam(required = false) String difficult,
            @RequestParam(defaultValue = "popular") String sort,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "12") int size) {
        BoardSearchRequest request = new BoardSearchRequest();
        request.setSource(source);
        request.setKeyword(keyword);
        request.setCategory(category);
        request.setCookTime(cookTime);
        request.setDifficult(difficult);
        request.setSort(sort);
        request.setPage(page);
        request.setSize(size);
        return ResponseEntity.ok(service.searchBoards(request));
    }

    @PutMapping("/boards/{boardNo}")
    public ResponseEntity<?> updateRecipe(
            @PathVariable int boardNo,
            @RequestBody BoardPut dto) {
        int result = service.updateRecipe(boardNo, dto);
        if (result > 0) return ResponseEntity.ok().build();
        return ResponseEntity.badRequest().body("레시피 수정에 실패했습니다.");
    }

    @DeleteMapping("/boards/{boardNo}")
    public ResponseEntity<?> deleteRecipe(@PathVariable int boardNo) {
        int result = service.deleteRecipe(boardNo);
        if (result > 0) return ResponseEntity.ok().build();
        return ResponseEntity.badRequest().body("레시피 삭제에 실패했습니다.");
    }

    @PostMapping("/boards/{boardNo}/likes")
    public ResponseEntity<?> toggleLikes(
            @PathVariable int boardNo,
            @RequestParam int userNo) {
        int result = service.toggleLikes(boardNo, userNo);

        if (result == -1) {
            return ResponseEntity.badRequest().body("본인 게시글은 좋아요할 수 없습니다.");
        } else if (result == 1) {
            return ResponseEntity.ok("좋아요를 눌렀습니다.");
        } else {
            return ResponseEntity.ok("좋아요를 취소했습니다.");
        }
    }

    @PostMapping("/boards/{boardNo}/scrap")
    public ResponseEntity<?> toggleScrap(
            @PathVariable int boardNo,
            @RequestParam int userNo) {
        int result = service.toggleScrap(boardNo, userNo);

        if (result == -1) {
            return ResponseEntity.badRequest().body("본인 게시글은 스크랩할 수 없습니다.");
        } else if (result == 1) {
            return ResponseEntity.ok("스크랩에 추가했습니다.");
        } else {
            return ResponseEntity.ok("스크랩을 취소했습니다.");
        }
    }

    @GetMapping("/boards/{boardNo}/scrap/status")
    public ResponseEntity<?> getScrapStatus(
            @PathVariable int boardNo,
            @RequestParam int userNo) {
        return ResponseEntity.ok(Map.of("scrapped", service.isScrapped(boardNo, userNo)));
    }

    @PostMapping("/boards/{boardNo}/comments")
    public ResponseEntity<?> insertComment(
            @PathVariable int boardNo,
            @RequestBody CommentWrite dto) {
        dto.setBoardNo(boardNo);
        int result = service.insertComment(dto);
        if (result > 0) return ResponseEntity.ok("댓글이 등록되었습니다.");
        return ResponseEntity.badRequest().body("댓글 등록에 실패했습니다.");
    }

    @GetMapping("/boards/{boardNo}/comments")
    public ResponseEntity<?> getCommentList(@PathVariable int boardNo) {
        return ResponseEntity.ok(service.getCommentList(boardNo));
    }

    @DeleteMapping("/comments/{commentNo}")
    public ResponseEntity<?> deleteComment(@PathVariable int commentNo) {
        int result = service.deleteComment(commentNo);
        if (result > 0) return ResponseEntity.ok("댓글이 삭제되었습니다.");
        return ResponseEntity.badRequest().body("댓글 삭제에 실패했습니다.");
    }
}
