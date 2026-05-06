package com.kh.cookmate.admin.model.vo;

import java.util.Date;

import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@Data
public class User {
	private int userNo;
	private String userEmail;
	private String nickname;
	private Date userEnrollDate;
	private char USER_STATUS;
	private char WITHDRAW;
}
