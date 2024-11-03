// src/redux/timeframeSlice
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { getTimeframetoLocalStorage } from "../../localstorage/timeframesettings";
import { FilterTimeframe } from "../../constants/timeframes";
import { COMPONENTS_WITH_TIMEFRAME } from "../../constants/constants";

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
      //reset all components default time frame
        if (state.value !== action.payload) {
          for (const componentsTimeframe of Object.values(COMPONENTS_WITH_TIMEFRAME)) {
            localStorage.setItem(componentsTimeframe + "_defaultTimeframe",action.payload );
          }
        }
      state.value = action.payload;
    },
  },
});

export const { setTimeframe } = timeframeSlice.actions;

export default timeframeSlice.reducer;
