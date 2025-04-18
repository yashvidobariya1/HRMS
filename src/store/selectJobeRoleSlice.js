import { createSlice } from "@reduxjs/toolkit";

const jobRoleSelect = createSlice({
  name: "jobRoleSelect",
  initialState: {
    jobRoleSelect: {},
  },
  reducers: {
    setJobRoleSelect: (state, action) => {
      // console.log("states==>", state, action);
      state.jobRoleSelect = action.payload;
    },
    clearJobRoleSelect: (state) => {
      state.jobRoleSelect = {};
    },
  },
});

export const { setJobRoleSelect, clearJobRoleSelect } = jobRoleSelect.actions;
export default jobRoleSelect.reducer;
