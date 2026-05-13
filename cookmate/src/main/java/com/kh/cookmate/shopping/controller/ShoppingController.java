package com.kh.cookmate.shopping.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.kh.cookmate.shopping.dto.ShoppingDto.BulkStatusRequest;
import com.kh.cookmate.shopping.dto.ShoppingDto.CreateRequest;
import com.kh.cookmate.shopping.dto.ShoppingDto.Detail;
import com.kh.cookmate.shopping.dto.ShoppingDto.ItemStatusRequest;
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

    @GetMapping("/shopping-lists/{shoppingNo}")
    public ResponseEntity<?> getShoppingDetail(
            @RequestParam int userNo,
            @PathVariable int shoppingNo) {
        Detail detail = shoppingService.getShoppingDetail(userNo, shoppingNo);
        if (detail == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(detail);
    }

    @PatchMapping("/shopping-lists/{shoppingNo}/items/{itemNo}/status")
    public ResponseEntity<?> updateShoppingItemStatus(
            @PathVariable int shoppingNo,
            @PathVariable int itemNo,
            @RequestBody ItemStatusRequest request) {
        if (!isValidStatus(request.getItemStatus())) {
            return ResponseEntity.badRequest().body("장보기 상태가 올바르지 않습니다.");
        }

        int result = shoppingService.updateShoppingItemStatus(
                request.getUserNo(),
                shoppingNo,
                itemNo,
                request.getItemStatus()
        );
        if (result > 0) return ResponseEntity.ok().build();
        return ResponseEntity.notFound().build();
    }

    @PatchMapping("/shopping-lists/{shoppingNo}/items/status")
    public ResponseEntity<?> updateAllShoppingItemStatus(
            @PathVariable int shoppingNo,
            @RequestBody BulkStatusRequest request) {
        if (!isValidStatus(request.getItemStatus())) {
            return ResponseEntity.badRequest().body("장보기 상태가 올바르지 않습니다.");
        }

        int result = shoppingService.updateAllShoppingItemStatus(
                request.getUserNo(),
                shoppingNo,
                request.getItemStatus()
        );
        if (result > 0) return ResponseEntity.ok().build();
        return ResponseEntity.notFound().build();
    }

    private boolean isValidStatus(String itemStatus) {
        return "NEED".equals(itemStatus)
                || "BOUGHT".equals(itemStatus)
                || "OWNED".equals(itemStatus)
                || "CANCEL".equals(itemStatus);
    }
}
