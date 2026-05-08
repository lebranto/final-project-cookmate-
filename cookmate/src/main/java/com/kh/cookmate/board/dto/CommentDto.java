package com.kh.cookmate.board.dto;

import java.util.List;

import lombok.Data;
import lombok.NoArgsConstructor;

public class CommentDto {

	@Data 
	@NoArgsConstructor
	public static class CommentWrite {
	    private int boardNo;
	    private Integer parentCommentNo;  // null이면 댓글, 값 있으면 답글
	    private String commentContent;
	    // TODO: JWT 완성 후 userNo 토큰에서 추출
	    private int userNo;
	    private String nickname;
	}

	@Data 
	@NoArgsConstructor
	public static class CommentDetail {
	    private int commentNo;
	    private Integer parentCommentNo;
	    private int userNo;
	    private String nickname;
	    private String profileImageUrl;
	    private String commentContent;
	    private char commentDelete;
	    private String commentPostdate;
	    private List<CommentDetail> replies;  // 답글 목록
	}
}