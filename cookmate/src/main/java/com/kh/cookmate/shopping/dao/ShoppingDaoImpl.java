package com.kh.cookmate.shopping.dao;

import java.util.Map;

import org.mybatis.spring.SqlSessionTemplate;
import org.springframework.stereotype.Repository;

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
}
