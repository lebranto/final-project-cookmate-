"use client";

export interface UserInfo {
  userNo: number;
  nickname: string;
  profileImageUrl: string;
  authority: string;
}

const TEMP_USER: UserInfo = {
  userNo: 1,
  nickname: "임시사용자",
  profileImageUrl: "",
  authority: "ROLE_USER",
};

export function useUserInfoActions() {
  return {
    userInfo: TEMP_USER,
    isLoggedIn: true,
  };
}
