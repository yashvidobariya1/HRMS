import { createSlice } from "@reduxjs/toolkit";

const userInfo = createSlice({
  name: "userInfo",
  initialState: {
    userInfo: {},
  },
  reducers: {
    setUserInfo: (state, action) => {
      // console.log("states==>", state, action);
      state.userInfo = action.payload;
    },
    clearUserInfo: (state) => {
      state.userInfo = {};
    },
  },
});

export const { setUserInfo, clearUserInfo } = userInfo.actions;
export default userInfo.reducer;
