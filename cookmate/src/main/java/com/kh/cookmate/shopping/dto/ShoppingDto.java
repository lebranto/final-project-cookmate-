package com.kh.cookmate.shopping.dto;

import java.util.List;

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

    @Data
    @NoArgsConstructor
    public static class ListItem {
        private int shoppingNo;
        private int boardNo;
        private String shoppingTitle;
        private String imageUrl;
        private String shoppingDate;
        private int totalCount;
        private int completedCount;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ListResponse {
        private List<ListItem> list;
        private int totalCount;
    }

    @Data
    @NoArgsConstructor
    public static class Detail {
        private int shoppingNo;
        private int userNo;
        private int boardNo;
        private String shoppingTitle;
        private String imageUrl;
        private String shoppingDate;
        private String cookTime;
        private String difficult;
        private String calory;
        private List<DetailItem> items;
    }

    @Data
    @NoArgsConstructor
    public static class DetailItem {
        private int itemNo;
        private int shoppingNo;
        private String setName;
        private String ingredientName;
        private String quantity;
        private String unit;
        private String itemStatus;
        private int itemOrder;
    }

    @Data
    @NoArgsConstructor
    public static class ItemStatusRequest {
        private int userNo;
        private String itemStatus;
    }

    @Data
    @NoArgsConstructor
    public static class BulkStatusRequest {
        private int userNo;
        private String itemStatus;
    }
}
