// src/redux/timeframeSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { getTimeframetoLocalStorage } from "../../localstorage/timeframesettings";
import { FilterTimeframe } from "../../constants/timeframes";

interface TimeframeState {
  value: FilterTimeframe;
}

const initialState: TimeframeState = {
  value: getTimeframetoLocalStorage(),
};

export const timeframeSlice = createSlice({
  name: "timeframe",
  initialState,
  reducers: {
    setTimeframe: (state, action: PayloadAction<FilterTimeframe>) => {
      state.value = action.payload;
    },
  },
});

export const { setTimeframe } = timeframeSlice.actions;

export default timeframeSlice.reducer;
