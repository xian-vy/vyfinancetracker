import { createSlice } from "@reduxjs/toolkit";
import { getTrendChartStacked } from "../../localstorage/trendchartsettings";

type TrendChartState = {
  stacked: boolean;
};

const initialState: TrendChartState = {
  stacked: getTrendChartStacked() || false,
};

const trendChartSlice = createSlice({
  name: "trendChart",
  initialState,
  reducers: {
    setStackedTrendChart: (state, action) => {
      state.stacked = action.payload as boolean;
    },
  },
});

export const { setStackedTrendChart } = trendChartSlice.actions;

export default trendChartSlice.reducer;


