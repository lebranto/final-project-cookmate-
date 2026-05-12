package com.kh.cookmate.shopping.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

public class ShoppingDto {

    @Data
    @NoArgsConstructor
    public static class CreateRequest {
        private int userNo;
        private int boardNo;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateResponse {
        private int shoppingNo;
        private boolean created;
    }
}
