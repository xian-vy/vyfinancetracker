import { createSlice } from "@reduxjs/toolkit";
import { getFontSize } from "../../localstorage/fontsettings";

type FontSizeState = {
  size: "sm" | "md";
};
const fontSizeSlice = createSlice({
  name: "fontSize",
  initialState: { size: getFontSize() || "sm" } as FontSizeState,
  reducers: {
    toggleFontSize: (state, action) => {
      state.size = action.payload;
    },
  },
});

export const { toggleFontSize } = fontSizeSlice.actions;

export default fontSizeSlice.reducer;
