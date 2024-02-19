// actions/budgetActions.ts
import { createAsyncThunk } from "@reduxjs/toolkit";

import { BudgetModel } from "../../models/BudgetModel";
import { addBudget, updateBudget, getBudget } from "../../firebase/BudgetService";

// Create an async action for fetching budget
export const fetchbudget = createAsyncThunk("budget/fetchBudget", async () => {
  return getBudget();
});

// Create an async action for adding an budget
export const addbudgetAction = createAsyncThunk("budget/addBudget", async (budgets: BudgetModel) => {
  const budgetDocRef = await addBudget(budgets);

  return budgetDocRef;
});

// Create an async action for updating an budget
export const updatebudgetAction = createAsyncThunk("budget/updateBudget", async (budgetData: BudgetModel) => {
  // Call your function to update data in the database
  updateBudget(budgetData);

  // Return the updated budget data
  return budgetData;
});
