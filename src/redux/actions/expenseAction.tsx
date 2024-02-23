// actions/expenseActions
import { createAsyncThunk } from "@reduxjs/toolkit";
import ExpenseModel from "../../models/ExpenseModel";
import {
  addExpensetoFirestore,
  deleteExpensetoFirestore,
  deleteMultipleExpenses,
  getExpenses,
  updateExpensetoFirestore,
  updateMultipleExpenses,
} from "../../firebase/ExpenseService";
import { Dispatch } from "react";

export const fetchExpenses = createAsyncThunk("expenses/fetchExpenses", async () => {
  return getExpenses();
});

export const addExpenseAction = createAsyncThunk("expenses/addExpense", async (expenseData: ExpenseModel) => {
  const id = await addExpensetoFirestore(expenseData);
  expenseData.id = id;
  return expenseData;
});

export const addExpenseToStateAction = (expenseData: ExpenseModel) => {
  return async (dispatch: Dispatch<any>) => {
    dispatch({
      type: "expenses/addExpenseToState",
      payload: expenseData,
    });
    return Promise.resolve();
  };
};

export const resetUploadProgress = () => {
  return { type: "expenses/resetUploadProgress" };
};

export const setUploadProgressAction = (progress: number) => ({
  type: "expenses/setUploadProgress",
  payload: progress,
});

export const updateExpenseAction = createAsyncThunk("expenses/updateExpense", async (expenseData: ExpenseModel) => {
  updateExpensetoFirestore(expenseData);
  return expenseData;
});

export const deleteExpenseAction = createAsyncThunk("expenses/deleteExpense", async (expense: ExpenseModel) => {
  deleteExpensetoFirestore(expense);
  return expense;
});

export const updateMultpleExpensesAction = createAsyncThunk(
  "expenses/updateMultipleExpenses",
  async (
    {
      expenseData,
      categoryId,
      accountId,
    }: { expenseData: ExpenseModel[]; categoryId: string | null; accountId: string | null },
    { rejectWithValue }
  ) => {
    try {
      await updateMultipleExpenses(expenseData, categoryId, accountId);

      const updatedExpenses = expenseData.map((expense) => {
        const updatedExpense = { ...expense };
        if (categoryId !== null) updatedExpense.category_id = categoryId;
        if (accountId !== null) updatedExpense.account_id = accountId;
        return updatedExpense;
      });

      return updatedExpenses;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);
export const deleteMultipleExpensesAction = createAsyncThunk(
  "expenses/deleteMultipleExpenses",
  async (expenses: ExpenseModel[]) => {
    await deleteMultipleExpenses(expenses);
    return expenses;
  }
);
