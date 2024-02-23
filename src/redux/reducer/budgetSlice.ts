// reducer/expenseReducer
import { createSlice } from "@reduxjs/toolkit";
import { BudgetModel } from "../../models/BudgetModel";
import { addbudgetAction, fetchbudget, updatebudgetAction } from "../actions/budgetAction";
import { RootState } from "../store";

interface BudgetState {
  budgets: BudgetModel[];
  loading: boolean;
  isfetching: boolean;
}

const initialState: BudgetState = {
  budgets: [],
  loading: false,
  isfetching: false,
};

const budgetSlice = createSlice({
  name: "budget",
  initialState,
  reducers: {
    resetLoadingBudget: (state) => {
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchbudget.pending, (state) => {
      state.isfetching = true;
    });
    builder.addCase(fetchbudget.fulfilled, (state, action) => {
      state.budgets = action.payload;
      state.isfetching = false;
    });

    builder.addCase(addbudgetAction.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(addbudgetAction.fulfilled, (state, action) => {
      state.budgets = [...state.budgets, action.payload];
      state.loading = false;
    });
    builder.addCase(updatebudgetAction.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(updatebudgetAction.fulfilled, (state, action) => {
      const index = state.budgets.findIndex((budget) => budget.id === action.payload.id);
      if (index !== -1) {
        state.budgets[index] = action.payload;
      }
      state.loading = false;
    });
  },
});

export const { resetLoadingBudget } = budgetSlice.actions;
export default budgetSlice.reducer;

export const selectFilteredBudgets = (state: RootState) => state.budget.budgets;
export const selectBudgetLoading = (state: RootState) => state.budget.loading;
