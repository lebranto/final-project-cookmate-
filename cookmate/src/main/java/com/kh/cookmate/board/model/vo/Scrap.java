package com.kh.cookmate.board.model.vo;

import java.util.Date;

import lombok.Data;

@Data
public class Scrap {
    private int scrapNo;
    private Integer boardNo;    // null 가능
    private int userNo;
    private Date scrapDate;
}
