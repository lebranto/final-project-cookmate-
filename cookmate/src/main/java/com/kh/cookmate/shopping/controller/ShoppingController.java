package com.kh.cookmate.shopping.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.kh.cookmate.shopping.dto.ShoppingDto.CreateRequest;
import com.kh.cookmate.shopping.service.ShoppingService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class ShoppingController {
    private final ShoppingService shoppingService;

    @PostMapping("/shopping-lists")
    public ResponseEntity<?> addRecipeToShoppingList(@RequestBody CreateRequest request) {
        if (request.getUserNo() <= 0 || request.getBoardNo() <= 0) {
            return ResponseEntity.badRequest().body("장보기 추가 정보가 올바르지 않습니다.");
        }

        return ResponseEntity.ok(shoppingService.addRecipeToShoppingList(request));
    }
}
