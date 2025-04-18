import { createSlice } from "@reduxjs/toolkit";

const themeColor = createSlice({
  name: "themeColor",
  initialState: {
    themeColor: "light",
  },
  reducers: {
    setThemeColor: (state, action) => {
      // console.log("states==>", state, action);
      state.themeColor = action.payload;
    },
    clearThemeColor: (state) => {
      state.themeColor = "light";
    },
  },
});

export const { setThemeColor, clearThemeColor } = themeColor.actions;
export default themeColor.reducer;
