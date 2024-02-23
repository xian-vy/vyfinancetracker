// actions/budgetActions
import { createAsyncThunk } from "@reduxjs/toolkit";
import IncomeModel from "../../models/IncomeModel";
import { addIncome, deleteIncome, getIncome, updateIncome } from "../../firebase/IncomeService";

// Create an async action for fetching income
export const fetchincome = createAsyncThunk("income/fetchIncome", async () => {
  return getIncome();
});

// Create an async action for adding an income
export const addincomeAction = createAsyncThunk("income/addIncome", async (incomeData: IncomeModel) => {
  // Call your function to save data to the database
  const id = await addIncome(incomeData);
  incomeData.id = id;
  return incomeData;
});

// Create an async action for updating an income
export const updateincomeAction = createAsyncThunk("income/updateIncome", async (incomeData: IncomeModel) => {
  // Call your function to update data in the database
  updateIncome(incomeData);

  // Return the updated Income data
  return incomeData;
});

export const deleteincomeAction = createAsyncThunk("income/deleteIncome", async (incomeId: string) => {
  // Call your function to delete data from the database
  deleteIncome(incomeId);
  // Return the expense ID so it can be used in the reducer
  return incomeId;
});
