import { createSlice } from "@reduxjs/toolkit";

const session = createSlice({
  name: "session",
  initialState: {
    session: false,
  },
  reducers: {
    setSession: (state, action) => {
      state.session = action.payload;
    },
    clearSession: (state) => {
      state.session = false;
    },
  },
});

export const { setSession, clearSession } = session.actions;
export default session.reducer;
