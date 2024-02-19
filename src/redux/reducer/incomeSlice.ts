// reducer/expenseReducer.ts
import { createSlice } from "@reduxjs/toolkit";
import IncomeModel from "../../models/IncomeModel";
import { addincomeAction, deleteincomeAction, fetchincome, updateincomeAction } from "../actions/incomeAction";
import { RootState } from "../store";

interface IncomeState {
  income: IncomeModel[];
  loading: boolean;
  isfetching: boolean;
}

const initialState: IncomeState = {
  income: [],
  loading: false,
  isfetching: false,
};

const incomeSlice = createSlice({
  name: "income",
  initialState,
  reducers: {
    resetLoadingIncome: (state) => {
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchincome.pending, (state) => {
      state.isfetching = true;
    });
    builder.addCase(fetchincome.fulfilled, (state, action) => {
      state.income = action.payload;
      state.isfetching = false;
    });
    builder.addCase(addincomeAction.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(addincomeAction.fulfilled, (state, action) => {
      state.income.push(action.payload);
      state.loading = false;
    });
    builder.addCase(deleteincomeAction.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(deleteincomeAction.fulfilled, (state, action) => {
      state.income = state.income.filter((income) => income.id !== action.payload);
      state.loading = false;
    });
    builder.addCase(updateincomeAction.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(updateincomeAction.fulfilled, (state, action) => {
      const index = state.income.findIndex((income) => income.id === action.payload.id);
      if (index !== -1) {
        state.income[index] = action.payload;
      }
      state.loading = false;
    });
  },
});

export const { resetLoadingIncome } = incomeSlice.actions;
export default incomeSlice.reducer;

export const selectFilteredIncome = (state: RootState) => state.income.income;
export const selectIncomeLoading = (state: RootState) => state.income.loading;
