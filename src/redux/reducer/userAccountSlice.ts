// src/redux/timeframeSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface initState {
  deleteMessage: string | undefined;
  isDeleting: boolean;
  isSigningIn: boolean;
}

const initialState: initState = {
  deleteMessage: undefined,
  isDeleting: false,
  isSigningIn: false,
};

export const userAccountSlice = createSlice({
  name: "userAccount",
  initialState,
  reducers: {
    setSuccessDeleteMessage: (state, action: PayloadAction<string | undefined>) => {
      state.deleteMessage = action.payload;
    },
    setIsDeleting: (state, action: PayloadAction<boolean>) => {
      state.isDeleting = action.payload;
    },
    setIsSigningIn: (state, action: PayloadAction<boolean>) => {
      state.isSigningIn = action.payload;
    },
  },
});

export const { setSuccessDeleteMessage, setIsDeleting, setIsSigningIn } = userAccountSlice.actions;

export default userAccountSlice.reducer;
