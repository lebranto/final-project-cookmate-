package com.kh.cookmate.shopping.dao;

import java.util.List;
import java.util.Map;

import com.kh.cookmate.shopping.dto.ShoppingDto.Detail;
import com.kh.cookmate.shopping.dto.ShoppingDto.DetailItem;
import com.kh.cookmate.shopping.dto.ShoppingDto.ListItem;
import com.kh.cookmate.shopping.model.vo.ShoppingList;

public interface ShoppingDao {
    Integer selectShoppingNoByUserAndBoard(Map<String, Object> params);

    int insertShoppingList(ShoppingList shoppingList);

    int insertShoppingItemsFromRecipe(int shoppingNo);

    List<ListItem> selectShoppingLists(int userNo);

    Detail selectShoppingDetail(Map<String, Object> params);

    List<DetailItem> selectShoppingItems(Map<String, Object> params);

    int updateShoppingItemStatus(Map<String, Object> params);

    int updateAllShoppingItemStatus(Map<String, Object> params);

    int deleteShoppingItems(Map<String, Object> params);

    int deleteShoppingList(Map<String, Object> params);
}
