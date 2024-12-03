/* !!!! DO NOT CHANGE !!!!*/
export const TEST_DATA = "This is a test string for encryption and decryption.";
export const ITERATIONS = 1000000;
export const APP_NAME = "VyFinanceTracker";
/* !!!! ------------- !!!!*/

export enum ASYNC_RESULT {
  success = "success",
  failed = "failed",
  nochange = "no change",
  error = "error",
  timeout = "timeout",
  duplicate = "duplicate",
}

export enum SORT_TYPE {
  date = "Date",
  amount = "Amount",
}

export enum ACTION_TYPES {
  AddContribution = "Add Contribution",
  MarkAsPaid = "Mark as Paid",
  Edit = "Edit",
  Delete = "Delete",
  Archive = "Archive",
}

export enum COMPONENTS_WITH_TIMEFRAME {
  DASHBOARD_OVERVIEW = "Overview",
  DASHBOARD_ACCOUNT_BALANCES = "Balances",
  DASHBOARD_TRENDS= "Trends",
  EXPENSES = "Expenses",
  BUDGETS = "Budgets",
  INCOME = "Income",
  SAVINGS = "Savings",
  REPORTS = "Reports",
  TRANSACTION_LOGS = "Transaction Logs",
}


export enum DEBT_STATUS {
  InProgress = "In Progress",
  Complete = "Completed",
  Archived = "Archived"
}