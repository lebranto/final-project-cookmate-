package com.kh.cookmate.shopping.dao;

import java.util.List;
import java.util.Map;

import org.mybatis.spring.SqlSessionTemplate;
import org.springframework.stereotype.Repository;

import com.kh.cookmate.shopping.dto.ShoppingDto.Detail;
import com.kh.cookmate.shopping.dto.ShoppingDto.DetailItem;
import com.kh.cookmate.shopping.dto.ShoppingDto.ListItem;
import com.kh.cookmate.shopping.model.vo.ShoppingList;

import lombok.RequiredArgsConstructor;

@Repository
@RequiredArgsConstructor
public class ShoppingDaoImpl implements ShoppingDao {
    private final SqlSessionTemplate session;

    @Override
    public Integer selectShoppingNoByUserAndBoard(Map<String, Object> params) {
        return session.selectOne("shoppingmapper.selectShoppingNoByUserAndBoard", params);
    }

    @Override
    public int insertShoppingList(ShoppingList shoppingList) {
        return session.insert("shoppingmapper.insertShoppingList", shoppingList);
    }

    @Override
    public int insertShoppingItemsFromRecipe(int shoppingNo) {
        return session.insert("shoppingmapper.insertShoppingItemsFromRecipe", shoppingNo);
    }

    @Override
    public List<ListItem> selectShoppingLists(int userNo) {
        return session.selectList("shoppingmapper.selectShoppingLists", userNo);
    }

    @Override
    public Detail selectShoppingDetail(Map<String, Object> params) {
        return session.selectOne("shoppingmapper.selectShoppingDetail", params);
    }

    @Override
    public List<DetailItem> selectShoppingItems(Map<String, Object> params) {
        return session.selectList("shoppingmapper.selectShoppingItems", params);
    }

    @Override
    public int updateShoppingItemStatus(Map<String, Object> params) {
        return session.update("shoppingmapper.updateShoppingItemStatus", params);
    }

    @Override
    public int updateAllShoppingItemStatus(Map<String, Object> params) {
        return session.update("shoppingmapper.updateAllShoppingItemStatus", params);
    }

    @Override
    public int deleteShoppingItems(Map<String, Object> params) {
        return session.delete("shoppingmapper.deleteShoppingItems", params);
    }

    @Override
    public int deleteShoppingList(Map<String, Object> params) {
        return session.delete("shoppingmapper.deleteShoppingList", params);
    }
}
