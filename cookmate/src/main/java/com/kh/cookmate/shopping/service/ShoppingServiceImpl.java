package com.kh.cookmate.shopping.service;

import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.kh.cookmate.shopping.dao.ShoppingDao;
import com.kh.cookmate.shopping.dto.ShoppingDto.CreateRequest;
import com.kh.cookmate.shopping.dto.ShoppingDto.CreateResponse;
import com.kh.cookmate.shopping.dto.ShoppingDto.Detail;
import com.kh.cookmate.shopping.dto.ShoppingDto.ListResponse;
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

    @Override
    public ListResponse getShoppingLists(int userNo) {
        var list = shoppingDao.selectShoppingLists(userNo);
        return new ListResponse(list, list.size());
    }

    @Override
    @Transactional
    public int deleteShoppingList(int shoppingNo, int userNo) {
        Map<String, Object> params = Map.of("shoppingNo", shoppingNo, "userNo", userNo);
        shoppingDao.deleteShoppingItems(params);
        return shoppingDao.deleteShoppingList(params);
    }

    @Override
    public Detail getShoppingDetail(int userNo, int shoppingNo) {
        Map<String, Object> params = Map.of("shoppingNo", shoppingNo, "userNo", userNo);
        Detail detail = shoppingDao.selectShoppingDetail(params);
        if (detail == null) return null;

        detail.setItems(shoppingDao.selectShoppingItems(params));
        return detail;
    }

    @Override
    @Transactional
    public int updateShoppingItemStatus(int userNo, int shoppingNo, int itemNo, String itemStatus) {
        return shoppingDao.updateShoppingItemStatus(Map.of(
                "userNo", userNo,
                "shoppingNo", shoppingNo,
                "itemNo", itemNo,
                "itemStatus", itemStatus
        ));
    }

    @Override
    @Transactional
    public int updateAllShoppingItemStatus(int userNo, int shoppingNo, String itemStatus) {
        return shoppingDao.updateAllShoppingItemStatus(Map.of(
                "userNo", userNo,
                "shoppingNo", shoppingNo,
                "itemStatus", itemStatus
        ));
    }
}
