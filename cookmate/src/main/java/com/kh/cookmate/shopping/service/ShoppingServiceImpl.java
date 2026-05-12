package com.kh.cookmate.shopping.service;

import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.kh.cookmate.shopping.dao.ShoppingDao;
import com.kh.cookmate.shopping.dto.ShoppingDto.CreateRequest;
import com.kh.cookmate.shopping.dto.ShoppingDto.CreateResponse;
import com.kh.cookmate.shopping.model.vo.ShoppingList;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ShoppingServiceImpl implements ShoppingService {
    private final ShoppingDao shoppingDao;

    @Override
    @Transactional
    public CreateResponse addRecipeToShoppingList(CreateRequest request) {
        Integer existingShoppingNo = shoppingDao.selectShoppingNoByUserAndBoard(
                Map.of("userNo", request.getUserNo(), "boardNo", request.getBoardNo())
        );

        if (existingShoppingNo != null) {
            return new CreateResponse(existingShoppingNo, false);
        }

        ShoppingList shoppingList = new ShoppingList();
        shoppingList.setUserNo(request.getUserNo());
        shoppingList.setBoardNo(request.getBoardNo());
        shoppingDao.insertShoppingList(shoppingList);
        shoppingDao.insertShoppingItemsFromRecipe(shoppingList.getShoppingNo());

        return new CreateResponse(shoppingList.getShoppingNo(), true);
    }
}
