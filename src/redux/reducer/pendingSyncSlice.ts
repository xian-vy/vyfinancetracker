import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface TimeframeState {
  count: number;
}

const initialState: TimeframeState = {
  count: 0,
};

export const pendingSyncSlice = createSlice({
  name: "pendingSync",
  initialState,
  reducers: {
    setPendingSyncCount: (state, action: PayloadAction<number>) => {
      state.count = action.payload;
    },
  },
});

export const { setPendingSyncCount } = pendingSyncSlice.actions;

export default pendingSyncSlice.reducer;
