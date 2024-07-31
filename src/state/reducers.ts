import { User, UserState } from "@/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";



 const initialState: UserState = {
  user: null,
  accessToken: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    setAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
    },
    clearUser: (state) => {
      state.user = null;
      state.accessToken = null;
    },
  },
});

export const { setUser, setAccessToken, clearUser } = userSlice.actions;

export default userSlice.reducer;
