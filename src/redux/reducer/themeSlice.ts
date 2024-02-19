import { createSlice } from "@reduxjs/toolkit";
import { getDarkMode } from "../../localstorage/darkmodesettings";

const themeSlice = createSlice({
  name: "theme",
  initialState: { darkMode: getDarkMode() },
  reducers: {
    toggleDarkMode: (state, action) => {
      state.darkMode = action.payload;
    },
  },
});

export const { toggleDarkMode } = themeSlice.actions;

export default themeSlice.reducer;
