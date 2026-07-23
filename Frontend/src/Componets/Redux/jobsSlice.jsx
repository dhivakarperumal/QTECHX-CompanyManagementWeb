import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchJobs = createAsyncThunk("jobs/fetchJobs", async () => {
  const response = await fetch("/Jobs.json"); 
  const data = await response.json();
  return data;
});

const jobSlice = createSlice({
  name: "jobs",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default jobSlice.reducer;
