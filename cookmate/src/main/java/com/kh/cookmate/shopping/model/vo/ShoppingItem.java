package com.kh.cookmate.shopping.model.vo;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class ShoppingItem {
    private int itemNo;
    private int shoppingNo;
    private String setName;
    private String ingredientName;
    private String quantity;
    private String unit;
    private String itemStatus;
    private int itemOrder;
}
