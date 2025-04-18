import { createSlice } from "@reduxjs/toolkit";

const notificationCount = createSlice({
  name: "notificationCount",
  initialState: {
    notificationCount: 0,
  },
  reducers: {
    setNotificationCount: (state, action) => {
      // console.log("states==>", state, action);
      state.notificationCount = action.payload;
    },
    clearNotificationCount: (state) => {
      state.notificationCount = 0;
    },
  },
});

export const { setNotificationCount, clearNotificationCount } =
  notificationCount.actions;
export default notificationCount.reducer;
