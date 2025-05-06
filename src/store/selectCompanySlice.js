import { createSlice } from "@reduxjs/toolkit";

const companySelect = createSlice({
  name: "companySelect",
  initialState: {
    companySelect: {},
  },
  reducers: {
    setCompanySelect: (state, action) => {
      // console.log("states==>", state, action);
      state.companySelect = action.payload;
    },
    clearCompanySelect: (state) => {
      state.companySelect = {};
    },
  },
});

export const { setCompanySelect, clearCompanySelect } = companySelect.actions;
export default companySelect.reducer;