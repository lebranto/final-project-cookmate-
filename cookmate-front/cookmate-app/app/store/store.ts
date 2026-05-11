import { initialState } from "@/app/features/userInfoSlice";

export const store = {
  getState: () => ({
    userInfo: initialState,
  }),
};

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = () => void;
