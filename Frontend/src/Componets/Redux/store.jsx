// src/redux/store.js
import { configureStore } from "@reduxjs/toolkit";
import serviceReducer from "./serviceSlice";
import projectReducer from "./projectSlice";
import reviewReducer from "./reviewSlice";
import priceReducer from "./priceSlice";
import teamReducer from "./teamSlice";
import jobsReducer from "./jobsSlice";

export const store = configureStore({
  reducer: {
    services: serviceReducer,
    projects: projectReducer,
    reviews: reviewReducer,
    prices: priceReducer,
    team: teamReducer,
    jobs: jobsReducer,
  },
});