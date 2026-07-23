import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchServices = createAsyncThunk("services/fetchServices", async () => {
  const response = await fetch("/Service.json"); 
  const data = await response.json();
  return data;
});

const serviceSlice = createSlice({
  name: "services",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchServices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default serviceSlice.reducer;