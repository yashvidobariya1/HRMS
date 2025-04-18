import { createSlice } from "@reduxjs/toolkit";

const roleSlice = createSlice({
  name: "role",
  initialState: {
    currentRole: "",
  },
  reducers: {
    setRole: (state, action) => {
      // console.log("states==>", state, action);
      state.currentRole = action.payload;
    },
    clearRole: (state) => {
      state.currentRole = "";
    },
  },
});

export const { setRole, clearRole } = roleSlice.actions;
export default roleSlice.reducer;
