// reducer/expenseReducer
import { createSlice } from "@reduxjs/toolkit";
import DebtModel from "../../models/DebtModel";
import { adddebtAction, deleteDebtsAction, fetchDebts, updateDebtsAction } from "../actions/debtAction";

interface Debt {
  debt: DebtModel[];
  loading: boolean;
  isfetching: boolean;
}
const initialState: Debt = {
  debt: [],
  loading: false,
  isfetching: false,
};

const debtSlice = createSlice({
  name: "debt",
  initialState,
  reducers: {
  },
  extraReducers: (builder) => {
    builder.addCase(fetchDebts.pending, (state) => {
      state.isfetching = true;
    });
    builder.addCase(fetchDebts.fulfilled, (state, action) => {
      state.debt = action.payload;
      state.isfetching = false;
    });

    builder.addCase(adddebtAction.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(adddebtAction.fulfilled, (state, action) => {
      state.debt = [...state.debt, action.payload];
      state.loading = false;
    });
    builder.addCase(deleteDebtsAction.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(deleteDebtsAction.fulfilled, (state, action) => {
      state.debt = state.debt.filter((debt) => debt.id !== action.payload);
      state.loading = false;
    });
    builder.addCase(updateDebtsAction.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(updateDebtsAction.fulfilled, (state, action) => {
      const index = state.debt.findIndex((debt) => debt.id === action.payload.id);
      if (index !== -1) {
        state.debt[index] = action.payload;
      }
      state.loading = false;
    });
  },
});

export default  debtSlice.reducer;
