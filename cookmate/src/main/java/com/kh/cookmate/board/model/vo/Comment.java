package com.kh.cookmate.board.model.vo;

import java.util.Date;

import lombok.Data;

@Data
public class Comment {
    private int commentNo;
    private int boardNo;
    private Integer parentCommentNo;  // null 가능 (답글)
    private int userNo;
    private String commentContent;
    private char commentDelete;
    private Date commentPostdate;
    private Date commentUpdatedDate;
}
