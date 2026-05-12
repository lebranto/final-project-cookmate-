package com.kh.cookmate.shopping.dao;

import java.util.Map;

import com.kh.cookmate.shopping.model.vo.ShoppingList;

public interface ShoppingDao {
    Integer selectShoppingNoByUserAndBoard(Map<String, Object> params);

    int insertShoppingList(ShoppingList shoppingList);

    int insertShoppingItemsFromRecipe(int shoppingNo);
}
