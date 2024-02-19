// reducer/expenseReducer.ts
import { createSlice } from "@reduxjs/toolkit";
import SavingGoalsContributionModel from "../../models/SavingGoalsContribution";
import SavingGoalsModel from "../../models/SavingGoalsModel";
import {
  addSavingsAction,
  addSavingsContributionsAction,
  deleteAllContributionsForSavingsAction,
  deleteSavingsAction,
  deleteSavingsContributionsAction,
  fetchSavings,
  fetchSavingsContributions,
  updateSavingsAction,
  updateSavingsContributionAction,
} from "../actions/savingsAction";

interface Savings {
  savings: SavingGoalsModel[];
  loading: boolean;
  isfetching: boolean;
}
const initialState: Savings = {
  savings: [],
  loading: false,
  isfetching: false,
};

interface SavingsContribution {
  contribution: SavingGoalsContributionModel[];
  loading: boolean;
  isfetching: boolean;
}
const initialContributionState: SavingsContribution = {
  contribution: [],
  loading: false,
  isfetching: false,
};

export const savingsSlice = createSlice({
  name: "savings",
  initialState,
  reducers: {
    resetLoadingSavingst: (state) => {
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchSavings.pending, (state) => {
      state.isfetching = true;
    });
    builder.addCase(fetchSavings.fulfilled, (state, action) => {
      state.savings = action.payload;
      state.isfetching = false;
    });

    builder.addCase(addSavingsAction.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(addSavingsAction.fulfilled, (state, action) => {
      state.savings = [...state.savings, action.payload];
      state.loading = false;
    });
    builder.addCase(deleteSavingsAction.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(deleteSavingsAction.fulfilled, (state, action) => {
      state.savings = state.savings.filter((savings) => savings.id !== action.payload);
      state.loading = false;
    });
    builder.addCase(updateSavingsAction.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(updateSavingsAction.fulfilled, (state, action) => {
      const index = state.savings.findIndex((savings) => savings.id === action.payload.id);
      if (index !== -1) {
        state.savings[index] = action.payload;
      }
      state.loading = false;
    });
  },
});

export const savingsContributionSlice = createSlice({
  name: "savings_contribution",
  initialState: initialContributionState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchSavingsContributions.pending, (state) => {
      state.isfetching = true;
    });
    builder.addCase(fetchSavingsContributions.fulfilled, (state, action) => {
      state.contribution = action.payload;
      state.isfetching = false;
    });

    builder.addCase(addSavingsContributionsAction.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(addSavingsContributionsAction.fulfilled, (state, action) => {
      state.contribution = [...state.contribution, action.payload];
      state.loading = false;
    });
    builder.addCase(updateSavingsContributionAction.fulfilled, (state, action) => {
      const index = state.contribution.findIndex((savings) => savings.id === action.payload.id);
      if (index !== -1) {
        state.contribution[index] = action.payload;
      }
      state.loading = false;
    });
    builder.addCase(deleteSavingsContributionsAction.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(deleteSavingsContributionsAction.fulfilled, (state, action) => {
      state.contribution = state.contribution.filter((contribution) => contribution.id !== action.payload);
      state.loading = false;
    });
    builder.addCase(deleteAllContributionsForSavingsAction.fulfilled, (state, action) => {
      state.contribution = state.contribution.filter((contribution) => !action.payload.includes(contribution.id));
    });
  },
});

export const { resetLoadingSavingst } = savingsSlice.actions;
export const {} = savingsContributionSlice.actions;
export const savingsReducer = savingsSlice.reducer;
export const savingsContributionReducer = savingsContributionSlice.reducer;
