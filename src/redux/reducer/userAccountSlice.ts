// src/redux/timeframeSlice
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { getLocalHideBalances } from "../../localstorage/hidebalancesettings";

interface initState {
  deleteMessage: string | undefined;
  isDeleting: boolean;
  isSigningIn: boolean;
  hideBalances: boolean;
}

const initialState: initState = {
  deleteMessage: undefined,
  isDeleting: false,
  isSigningIn: false,
  hideBalances: getLocalHideBalances() || false,
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
    setHideBalances: (state, action: PayloadAction<boolean>) => {
      state.hideBalances = action.payload;
    },
  },
});

export const { setSuccessDeleteMessage, setIsDeleting, setIsSigningIn, setHideBalances } = userAccountSlice.actions;

export default userAccountSlice.reducer;
