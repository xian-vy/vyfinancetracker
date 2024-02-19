export enum collections {
  Expenses = "Expenses",
  Budgets = "Budgets",
  Income = "Income",
  SavingGoalsContributions = "SavingGoalsContributions",
  SavingGoals = "SavingGoals",
  AccountTypes = "AccountTypes",
  Categories = "Categories",
  IncomeSources = "IncomeSources",
  Transaction_Logs = "TransactionLogs",
  Users = "Users",
}

export enum subcollections {
  accounttypes = "accounttypes",
  categories = "categories",
  incomesources = "incomesources",
  logs = "logs",
  expenses = "expenses",
  budgets = "budgets",
}

export enum txn_types {
  Expenses = "Expense",
  Income = "Income",
  Budget = "Budget",
  Savings = "Savings",
  SavingsContribution = "Savings Contribution",
}

export enum txn_summary {
  Balance = "Net Worth",
  Expenses = "Expense",
  Income = "Income",
  Budget = "Budget",
  Savings = "Saving Goals",
}

export enum operation_types {
  Create = "Create",
  Update = "Update",
  Delete = "Delete",
  Add = "Add",
}
