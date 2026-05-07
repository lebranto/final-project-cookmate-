package com.kh.cookmate.member.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.kh.cookmate.member.dto.MemberDto;
import com.kh.cookmate.member.service.MemberServiceImpl;
import com.kh.cookmate.member.vo.Member;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/users")
public class MemberController {

    private final MemberServiceImpl userService;
    
    //마이페이지 유저 정보 가져오기
    @GetMapping("/mypage/{userNo}")
    public ResponseEntity<MemberDto> getMyPageInfo(@PathVariable("userNo") long userNo) {
        MemberDto user = userService.selectUserByNo(userNo);
        
        if (user != null) {
            return ResponseEntity.ok(user);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
     
    @GetMapping("/ranking")
    public ResponseEntity<List<MemberDto>> getChefRanking(
        @RequestParam(value="filter", defaultValue="recipe") String filter) {
        
        List<MemberDto> list = userService.selectChefRanking(filter);
        return ResponseEntity.ok(list);
    }
}