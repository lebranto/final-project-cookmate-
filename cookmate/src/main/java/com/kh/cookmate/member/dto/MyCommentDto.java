package com.kh.cookmate.member.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MyCommentDto {
	private long commentNo;
    private String commentContent;
    private String commentPostDate;
    private long boardNo;
    private String boardTitle;
    
    private String commenterNickname;
    private String commenterProfileUrl;
    
    private int replyCount;
}
