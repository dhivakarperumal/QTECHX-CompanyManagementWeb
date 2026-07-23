// src/Redux/priceSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchPrices = createAsyncThunk("prices/fetchPrices", async () => {
  const response = await fetch("/Price.json"); 
  const data = await response.json();
  return data;
});

const priceSlice = createSlice({
  name: "prices",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPrices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPrices.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchPrices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default priceSlice.reducer;
