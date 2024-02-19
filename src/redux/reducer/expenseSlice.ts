// reducer/expenseReducer.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import ExpenseModel from "../../models/ExpenseModel";
import {
  addExpenseAction,
  deleteExpenseAction,
  deleteMultipleExpensesAction,
  fetchExpenses,
  updateExpenseAction,
  updateMultpleExpensesAction,
} from "../actions/expenseAction";

interface ExpenseState {
  expenses: ExpenseModel[];
  uploadProgress: number;
  loading: boolean;
  isfetching: boolean;
  uploadCount: number;
  isUploading: boolean;
  uploadError: string | null;
  uploadCancelled: boolean;
  fetchCount: number;
  completedFetchCount: number;
}
const initialState: ExpenseState = {
  expenses: [],
  uploadProgress: 0,
  loading: false,
  isfetching: false,
  uploadCount: 0,
  isUploading: false,
  uploadError: null,
  uploadCancelled: false,
  fetchCount: 0,
  completedFetchCount: 0,
};

const expenseSlice = createSlice({
  name: "expenses",
  initialState,
  reducers: {
    resetUploadProgress: (state) => {
      state.uploadProgress = 0;
      state.isUploading = false;
    },
    addExpenseToState: (state, action: PayloadAction<ExpenseModel>) => {
      state.expenses.push(action.payload);
    },
    setUploadCount: (state, action: PayloadAction<number>) => {
      state.uploadCount = action.payload;
    },

    setUploadCancelled: (state, action: PayloadAction<boolean>) => {
      state.uploadCancelled = action.payload;
    },
    setUploadError: (state, action: PayloadAction<string | null>) => {
      state.uploadError = action.payload;
    },
    setUploadStatus: (state, action: PayloadAction<boolean>) => {
      state.isUploading = action.payload;
    },
    resetLoadingExpense: (state) => {
      state.loading = false;
    },
    setUploadProgress: (state, action: PayloadAction<number>) => {
      state.uploadProgress = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder.addCase(fetchExpenses.pending, (state) => {
      state.isfetching = true;
    });
    builder.addCase(fetchExpenses.fulfilled, (state, action) => {
      state.expenses = action.payload;
      state.isfetching = false;
    });
    builder.addCase(deleteExpenseAction.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(deleteExpenseAction.fulfilled, (state, action) => {
      state.expenses = state.expenses.filter((expense) => expense.id !== action.payload.id);
      state.loading = false;
    });
    builder.addCase(addExpenseAction.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(addExpenseAction.fulfilled, (state, action) => {
      state.expenses.push(action.payload);
      state.loading = false;
    });
    builder.addCase(addExpenseAction.rejected, (state, action) => {
      state.loading = false;
      state.isUploading = false;
      state.uploadError = action.error.message || "An error has occured.";
    });
    builder.addCase(updateExpenseAction.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(updateExpenseAction.fulfilled, (state, action) => {
      const index = state.expenses.findIndex((expense) => expense.id === action.payload.id);
      if (index !== -1) {
        state.expenses[index] = action.payload;
      }
      state.loading = false;
    });
    builder.addCase(updateMultpleExpensesAction.fulfilled, (state, action) => {
      // Create a copy of the state, for atomicity
      let newState = [...state.expenses];
      //if error occurs here, prevState remain as is
      action.payload.forEach((updatedExpense) => {
        const index = newState.findIndex((expense) => expense.id === updatedExpense.id);
        if (index !== -1) {
          newState[index] = updatedExpense;
        }
      });
      state.expenses = newState;
    });
    builder.addCase(updateMultpleExpensesAction.rejected, (state, action) => {
      // Handle the error case, for example by setting an error message in the state
      //  state.uploadError = action.error.message || "An error has occurred while updating expenses.";
      console.error("Batch  expense updated failed");
    });
    builder.addCase(deleteMultipleExpensesAction.fulfilled, (state, action) => {
      // Create a copy of the state, for atomicity
      let newState = [...state.expenses];
      //if error occurs here, prevState remain as is
      action.payload.forEach((deletedExpense) => {
        newState = newState.filter((expense) => expense.id !== deletedExpense.id);
      });
      state.expenses = newState;
    });
    builder.addCase(deleteMultipleExpensesAction.rejected, (state, action) => {
      console.error("Batch expense delete failed");
    });
  },
});

// export const selectFetchCount = (state: RootState) => state.expenses.fetchCount;
// export const selectCompletedFetchCount = (state: RootState) => state.expenses.completedFetchCount;

export const {
  resetUploadProgress,
  resetLoadingExpense,
  setUploadCount,
  setUploadStatus,
  setUploadError,
  setUploadCancelled,
} = expenseSlice.actions;
export default expenseSlice.reducer;
