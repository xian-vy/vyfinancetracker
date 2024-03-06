import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "firebase/auth"; // Import the User type from Firebase

interface AuthState {
  authenticating: boolean;
  user: User | null;
  persistentId: string | null;
}

const initialState: AuthState = {
  authenticating: true,
  user: null,
  persistentId: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setIsAuthenticating: (state, action: PayloadAction<boolean>) => {
      state.authenticating = action.payload;
    },
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
    },
    setPersistentId: (state, action: PayloadAction<string | null>) => {
      state.persistentId = action.payload;
    },
  },
});

export const { setIsAuthenticating, setUser, setPersistentId } = authSlice.actions;

export default authSlice.reducer;
