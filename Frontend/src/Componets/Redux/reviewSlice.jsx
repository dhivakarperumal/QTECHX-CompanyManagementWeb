// src/Redux/reviewSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Async thunk to fetch reviews
export const fetchReviews = createAsyncThunk("reviews/fetchReviews", async () => {
  const response = await fetch("/Review.json"); // make sure this file exists in public/
  const data = await response.json();
  return data;
});

const reviewSlice = createSlice({
  name: "reviews",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default reviewSlice.reducer;
