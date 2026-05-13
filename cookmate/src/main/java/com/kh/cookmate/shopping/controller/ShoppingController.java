package com.kh.cookmate.shopping.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
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

    @GetMapping("/shopping-lists")
    public ResponseEntity<?> getShoppingLists(@RequestParam int userNo) {
        if (userNo <= 0) {
            return ResponseEntity.badRequest().body("사용자 정보가 올바르지 않습니다.");
        }

        return ResponseEntity.ok(shoppingService.getShoppingLists(userNo));
    }

    @DeleteMapping("/shopping-lists/{shoppingNo}")
    public ResponseEntity<?> deleteShoppingList(
            @PathVariable int shoppingNo,
            @RequestParam int userNo) {
        int result = shoppingService.deleteShoppingList(shoppingNo, userNo);
        if (result > 0) return ResponseEntity.ok().build();
        return ResponseEntity.notFound().build();
    }
}
