package com.kh.cookmate.board.model.vo;

import lombok.Data;

@Data
public class Ingredient {
    private int ingredientNo;
    private int setNo;
    private String ingredientName;
    private String quantity;
    private String unit;
}
