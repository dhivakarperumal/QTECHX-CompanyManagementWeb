// src/redux/teamSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Async thunk to fetch team members
export const fetchTeamMembers = createAsyncThunk(
  "team/fetchTeamMembers",
  async () => {
    const response = await fetch("/TeamMember.json"); // Place file in public/
    return await response.json();
  }
);

const teamSlice = createSlice({
  name: "team",
  initialState: {
    members: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTeamMembers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTeamMembers.fulfilled, (state, action) => {
        state.loading = false;
        state.members = action.payload;
      })
      .addCase(fetchTeamMembers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default teamSlice.reducer;