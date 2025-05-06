import { createSlice } from "@reduxjs/toolkit";

const employeeformFilled = createSlice({
  name: "employeeformFilled",
  initialState: {
    employeeformFilled: false,
  },
  reducers: {
    setEmployeeformFilled: (state, action) => {
      // console.log("states==>", state, action);
      state.employeeformFilled = action.payload;
    },
    clearEmployeeformFilled: (state) => {
      state.employeeformFilled = false;
    },
  },
});

export const { setEmployeeformFilled, clearEmployeeformFilled } =
  employeeformFilled.actions;
export default employeeformFilled.reducer;
