// src/redux/timeframeSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface initState {
  msg: string | undefined;
  isDeleting: boolean;
}

const initialState: initState = {
  msg: undefined,
  isDeleting: false,
};

export const deleteAccountSlice = createSlice({
  name: "deleteMessage",
  initialState,
  reducers: {
    setSuccessDeleteMessage: (state, action: PayloadAction<string | undefined>) => {
      state.msg = action.payload;
    },
    setIsDeleting: (state, action: PayloadAction<boolean>) => {
      state.isDeleting = action.payload;
    },
  },
});

export const { setSuccessDeleteMessage, setIsDeleting } = deleteAccountSlice.actions;

export default deleteAccountSlice.reducer;
