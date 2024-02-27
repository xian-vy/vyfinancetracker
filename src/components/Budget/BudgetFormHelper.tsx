import React from "react";
import { operation_types, txn_types } from "../../constants/collections";
import { BudgetItemsModel, BudgetModel } from "../../models/BudgetModel";
import { v4 as uuidv4 } from "uuid";
import { Timestamp } from "firebase/firestore";
import { addbudgetAction, updatebudgetAction } from "../../redux/actions/budgetAction";
import TransactionLogsModel from "../../models/TransactionLogsModel";
import { ASYNC_RESULT } from "../../constants/constants";
import { BudgetTimeframe } from "../../constants/timeframes";
import { ThunkDispatch } from "@reduxjs/toolkit";

type BudgetSubmitParams = {
  isEditMode: boolean;
  selectedMonth: Date;
  selectedYear: Date;
  categoryAmounts: { [categoryId: string]: number };
  budgetSlice: BudgetModel[];
  dispatch: ThunkDispatch<any, any, any>;
  saveBatchLogs: (logs: TransactionLogsModel[]) => Promise<void>;
};

export const budgetFormSubmit = async ({
  isEditMode,
  selectedMonth,
  selectedYear,
  categoryAmounts,
  budgetSlice,
  dispatch,
  saveBatchLogs,
}: BudgetSubmitParams): Promise<ASYNC_RESULT> => {
  try {
    let operation: operation_types = operation_types.Create;
    const formattedSelectedMonth = selectedMonth.toLocaleString("default", { month: "long" });
    const formattedSelectedYear = selectedYear.getFullYear().toString();
    const monthYearHeader = `${formattedSelectedMonth} ${formattedSelectedYear}`;

    const budgetItems: BudgetItemsModel[] = Object.entries(categoryAmounts)
      .filter(([_, amount]) => amount > 0)
      .map(([categoryId, amount]) => ({
        id: uuidv4(),
        amount,
        category_id: categoryId,
        date: Timestamp.fromDate(new Date(selectedYear.getFullYear(), selectedMonth.getMonth(), 1)),
      }));

    if (isEditMode) {
      const result = await updateBudget({
        operation,
        budgetSlice,
        monthYearHeader,
        budgetItems,
        dispatch,
        saveBatchLogs,
      });

      if (result === ASYNC_RESULT.nochange) {
        return ASYNC_RESULT.nochange;
      }
    } else {
      await addBudget({ operation, budgetSlice, monthYearHeader, budgetItems, dispatch, saveBatchLogs });
    }

    return ASYNC_RESULT.success;
  } catch (error) {
    console.error("Error submitting budgets", error);
    return ASYNC_RESULT.failed;
  }
};

type BudgetParams = {
  operation: string;
  budgetSlice: BudgetModel[];
  monthYearHeader: string;
  budgetItems: BudgetItemsModel[];
  dispatch: ThunkDispatch<any, any, any>;
  saveBatchLogs: (logs: TransactionLogsModel[]) => Promise<void>;
};

async function updateBudget({
  operation,
  budgetSlice,
  monthYearHeader,
  budgetItems,
  dispatch,
  saveBatchLogs,
}: BudgetParams): Promise<ASYNC_RESULT> {
  try {
    operation = operation_types.Update;
    const existingBudgetIndex = budgetSlice.findIndex((budget) => budget.monthYear === monthYearHeader);
    const existingBudget = budgetSlice[existingBudgetIndex];
    const updatedBudget: BudgetModel = {
      ...budgetSlice[existingBudgetIndex],
      budgets: budgetItems,
    };

    const hasAmountChanges =
      budgetItems.length !== existingBudget.budgets.length ||
      budgetItems.some((newBudgetItem) => {
        const existingBudgetItem = existingBudget.budgets.find(
          (item) => item.category_id === newBudgetItem.category_id
        );
        return !existingBudgetItem || existingBudgetItem.amount !== newBudgetItem.amount;
      });

    if (hasAmountChanges) {
      const actionResult = await dispatch(updatebudgetAction(updatedBudget));
      if (updatebudgetAction.fulfilled.match(actionResult)) {
        let logsToSave: TransactionLogsModel[] = [];
        const now = Timestamp.now();
        const newBudgetWithId = actionResult.payload;

        newBudgetWithId.budgets.forEach((budget) => {
          const log: TransactionLogsModel = {
            txn_id: uuidv4(),
            txn_ref_id: budget.id,
            txn_type: txn_types.Budget,
            operation: operation,
            category_id: budget.category_id,
            account_id: "",
            amount: budget.amount,
            lastModified: now,
          };
          logsToSave.push(log);
        });
        await saveBatchLogs(logsToSave);
        return ASYNC_RESULT.success;
      }
    } else {
      return ASYNC_RESULT.nochange;
    }
  } catch (error) {
    console.error("Error updating budgets:", error);
    return ASYNC_RESULT.failed;
  }
  return ASYNC_RESULT.success;
}

async function addBudget({
  operation,
  budgetSlice,
  monthYearHeader,
  budgetItems,
  dispatch,
  saveBatchLogs,
}: BudgetParams): Promise<ASYNC_RESULT> {
  try {
    operation = operation_types.Create;

    const isDuplicate = budgetSlice.some((budget) => budget.monthYear === monthYearHeader);
    if (isDuplicate) {
      return ASYNC_RESULT.duplicate;
    }

    const budgetBatch: BudgetModel = {
      budgets: budgetItems,
      monthYear: monthYearHeader,
      timeframe: BudgetTimeframe.Month,
    };
    const actionResult = await dispatch(addbudgetAction(budgetBatch));
    if (addbudgetAction.fulfilled.match(actionResult)) {
      let logsToSave: TransactionLogsModel[] = [];
      const now = Timestamp.now();

      const newBudgetWithId = actionResult.payload;

      newBudgetWithId.budgets.forEach((budget) => {
        const log: TransactionLogsModel = {
          txn_id: uuidv4(),
          txn_ref_id: budget.id,
          txn_type: txn_types.Budget,
          operation: operation,
          category_id: budget.category_id,
          account_id: "",
          amount: budget.amount,
          lastModified: now,
        };
        logsToSave.push(log);
      });
      await saveBatchLogs(logsToSave);
      return ASYNC_RESULT.success;
    }
  } catch (error) {
    console.error("Error adding budgets:", error);
    return ASYNC_RESULT.failed;
  }
  return ASYNC_RESULT.success;
}

export const checkForExistingBudget = (date: Date, budgetSlice: BudgetModel[]) => {
  const formattedSelectedMonth = date.toLocaleString("default", { month: "long" });
  const formattedSelectedYear = date.getFullYear().toString();
  const monthYearHeader = `${formattedSelectedMonth} ${formattedSelectedYear}`;

  const existingBudget = budgetSlice.find((budget) => budget.monthYear === monthYearHeader);
  if (existingBudget) {
    const amounts = existingBudget.budgets.reduce((acc: { [key: string]: number }, item) => {
      acc[item.category_id] = item.amount;
      return acc;
    }, {});

    return amounts;
  } else {
    return null;
  }
};

export const getPreviousMonthYear = (date: Date) => {
  const prevMonthDate = new Date(date.getFullYear(), date.getMonth() - 1, 1);
  const formattedPrevMonth = prevMonthDate.toLocaleString("default", { month: "short" });
  const formattedPrevYear = prevMonthDate.getFullYear().toString();
  return `${formattedPrevMonth} ${formattedPrevYear}`;
};

export const copyPreviousBudget = (selectedMonth: Date, budgetSlice: BudgetModel[]) => {
  // Calculate the previous month and year
  const prevMonthDate = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1, 1);
  const formattedPrevMonth = prevMonthDate.toLocaleString("default", { month: "long" });
  const formattedPrevYear = prevMonthDate.getFullYear().toString();
  const prevMonthYearHeader = `${formattedPrevMonth} ${formattedPrevYear}`;

  // Find the budget for the previous month and year
  const prevBudget = budgetSlice.find((budget) => budget.monthYear === prevMonthYearHeader);
  if (prevBudget) {
    const prevAmounts = prevBudget.budgets.reduce((acc: { [key: string]: number }, item) => {
      acc[item.category_id] = item.amount;
      return acc;
    }, {});
    return prevAmounts;
  } else {
    return null;
  }
};
