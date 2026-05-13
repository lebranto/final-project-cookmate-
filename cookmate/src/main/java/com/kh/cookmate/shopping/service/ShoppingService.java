package com.kh.cookmate.shopping.service;

import com.kh.cookmate.shopping.dto.ShoppingDto.CreateRequest;
import com.kh.cookmate.shopping.dto.ShoppingDto.CreateResponse;
import com.kh.cookmate.shopping.dto.ShoppingDto.ListResponse;

public interface ShoppingService {
    CreateResponse addRecipeToShoppingList(CreateRequest request);

    ListResponse getShoppingLists(int userNo);

    int deleteShoppingList(int shoppingNo, int userNo);
}
