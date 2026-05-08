import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserInfo {
  userNo: number;
  nickname: string;
  profileImageUrl: string;
  authority: string;
}

interface UserInfoState {
  userInfo: UserInfo | null;
  isLoggedIn: boolean;
}

const initialState: UserInfoState = {
  userInfo: null,
  isLoggedIn: false,
};

const userInfoSlice = createSlice({
  name: "userInfo",
  initialState,
  reducers: {
    setUserInfo: (state, action: PayloadAction<UserInfo>) => {
      state.userInfo = action.payload;
      state.isLoggedIn = true;
    },
    clearUserInfo: (state) => {
      state.userInfo = null;
      state.isLoggedIn = false;
    },
  },
});

export const { setUserInfo, clearUserInfo } = userInfoSlice.actions;
export default userInfoSlice.reducer;