package com.kh.cookmate.shopping.service;

import com.kh.cookmate.shopping.dto.ShoppingDto.CreateRequest;
import com.kh.cookmate.shopping.dto.ShoppingDto.CreateResponse;

public interface ShoppingService {
    CreateResponse addRecipeToShoppingList(CreateRequest request);
}
