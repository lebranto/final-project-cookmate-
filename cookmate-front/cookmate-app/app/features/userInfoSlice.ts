export interface UserInfo {
  userNo: number;
  nickname: string;
  profileImageUrl: string;
  authority: string;
}

export interface UserInfoState {
  userInfo: UserInfo | null;
  isLoggedIn: boolean;
}

export const initialState: UserInfoState = {
  userInfo: null,
  isLoggedIn: false,
};

export const setUserInfo = (userInfo: UserInfo) => ({
  type: "userInfo/setUserInfo",
  payload: userInfo,
});

export const clearUserInfo = () => ({
  type: "userInfo/clearUserInfo",
});

export default function userInfoReducer(state = initialState) {
  return state;
}
