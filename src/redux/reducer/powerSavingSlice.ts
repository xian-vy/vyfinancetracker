import { createSlice } from "@reduxjs/toolkit";
import { getPowerSavingMode } from "../../localstorage/powersavingsettings";

const powerSavingSlice = createSlice({
  name: "powerSaving",
  initialState: { enabled: getPowerSavingMode() || false },
  reducers: {
    togglePowerSavingMode: (state, action) => {
      state.enabled = action.payload;
    },
  },
});

export const { togglePowerSavingMode } = powerSavingSlice.actions;

export default powerSavingSlice.reducer;
