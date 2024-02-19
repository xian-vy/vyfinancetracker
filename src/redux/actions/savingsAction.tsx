// actions/SavingsActions.ts
import { createAsyncThunk } from "@reduxjs/toolkit";

import SavingGoalsModel from "../../models/SavingGoalsModel";
import {
  addSavings,
  updateSavings,
  getSavings,
  deleteSavings,
  getSavingsContributions,
  deleteSavingsContribution,
  addSavingsContribution,
  updateSavingsContribution,
} from "../../firebase/SavingGoalsService";
import SavingGoalsContribution from "../../models/SavingGoalsContribution";
import { RootState } from "../store";

// Create an async action for fetching Savings
export const fetchSavings = createAsyncThunk("Savings/fetchSavings", async () => {
  return getSavings();
});

export const fetchSavingsContributions = createAsyncThunk("Savings/fetchSavingsContributions", async () => {
  return getSavingsContributions();
});

// Create an async action for adding an Savings
export const addSavingsAction = createAsyncThunk("Savings/addSavings", async (data: SavingGoalsModel) => {
  // Call your function to save data to the database
  const id = await addSavings(data);

  data.id = id;
  // Return the Savings data so that it can be used in the reducer
  return data;
});

export const addSavingsContributionsAction = createAsyncThunk(
  "Savings/addSavingsContributions",
  async (data: SavingGoalsContribution) => {
    // Call your function to save data to the database
    const id = await addSavingsContribution(data);

    data.id = id;
    // Return the Savings data so that it can be used in the reducer
    return data;
  }
);

// Create an async action for updating an Savings
export const updateSavingsAction = createAsyncThunk("Savings/updateSavings", async (data: SavingGoalsModel) => {
  // Call your function to update data in the database
  updateSavings(data);

  // Return the updated Savings data
  return data;
});
export const updateSavingsContributionAction = createAsyncThunk(
  "Savings/updateSavingsContribution",
  async (data: SavingGoalsContribution) => {
    // Call your function to update data in the database
    updateSavingsContribution(data);

    // Return the updated Savings data
    return data;
  }
);

export const deleteSavingsAction = createAsyncThunk("Savings/deleteSavings", async (Id: string) => {
  // Call your function to delete data from the database
  deleteSavings(Id);
  // Return the expense ID so it can be used in the reducer
  return Id;
});

export const deleteSavingsContributionsAction = createAsyncThunk(
  "Savings/deleteSavingsContributions",
  async (contributionId: string) => {
    // Call your function to delete data from the database
    deleteSavingsContribution(contributionId);
    // Return the expense ID so it can be used in the reducer
    return contributionId;
  }
);

export const deleteAllContributionsForSavingsAction = createAsyncThunk(
  "Savings/deleteAllContributionsForSavings",
  async (savingsId: string, { getState }) => {
    const state = getState() as RootState;
    const contributions = state.savingsContribution.contribution;
    const contributionIdsToDelete = contributions
      .filter((contribution) => contribution.savingsId === savingsId)
      .map((contribution) => contribution.id);

    return contributionIdsToDelete;
  }
);
