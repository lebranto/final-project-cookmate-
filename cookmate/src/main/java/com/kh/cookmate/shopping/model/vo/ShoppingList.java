package com.kh.cookmate.shopping.model.vo;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class ShoppingList {
    private int shoppingNo;
    private int userNo;
    private int boardNo;
    private String shoppingTitle;
    private String imageUrl;
}
