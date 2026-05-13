package com.kh.cookmate.shopping.service;

import com.kh.cookmate.shopping.dto.ShoppingDto.CreateRequest;
import com.kh.cookmate.shopping.dto.ShoppingDto.CreateResponse;
import com.kh.cookmate.shopping.dto.ShoppingDto.Detail;
import com.kh.cookmate.shopping.dto.ShoppingDto.ListResponse;

public interface ShoppingService {
    CreateResponse addRecipeToShoppingList(CreateRequest request);

    ListResponse getShoppingLists(int userNo);

    Detail getShoppingDetail(int userNo, int shoppingNo);

    int updateShoppingItemStatus(int userNo, int shoppingNo, int itemNo, String itemStatus);

    int updateAllShoppingItemStatus(int userNo, int shoppingNo, String itemStatus);

    int deleteShoppingList(int shoppingNo, int userNo);
}
