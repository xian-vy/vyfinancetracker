import { Timestamp } from "@firebase/firestore";
import ExpenseModel from "../models/ExpenseModel";
import IncomeModel from "../models/IncomeModel";
import SavingGoalsModel from "../models/SavingGoalsModel";
import { BudgetItemsModel, BudgetModel } from "../models/BudgetModel";
import { v4 as uuidv4 } from "uuid";
import { mock_categories } from "../firebase/defaultData";
import SavingGoalsContributionModel from "../models/SavingGoalsContribution";

/* TIMESTAMP MOCK ---------------------------------------------------------------------------*/
export const mock_timestamps = [
  //January 1, 2023
  { date: Timestamp.fromDate(new Date(2023, 0, 1)), amount: 100 },

  //January 15, 2023
  { date: Timestamp.fromDate(new Date(2023, 0, 15)), amount: 200 },
];

/* CATEGORIES -------------------------------------------------------------------------------*/

const categoriesWithIds = mock_categories.Category.map((cat, index) => ({
  ...cat,
  id: uuidv4() + index,
}));

const accountsWithIds = mock_categories.Account_Type.map((acct, index) => ({
  ...acct,
  id: uuidv4() + index,
}));

const incomeSourceWithIds = mock_categories.Income_source.map((is, index) => ({
  ...is,
  id: uuidv4() + index,
}));

const getRandomElement = (array: any[]) => array[Math.floor(Math.random() * array.length)];

/* EXPENSE -------------------------------------------------------------------------------*/
const generateExpenseData = (year: number, month: number) => {
  const date = new Date(year, month, 1);
  const randomCategory = getRandomElement(categoriesWithIds);
  const randomAccount = getRandomElement(accountsWithIds);

  return {
    id: uuidv4(),
    description: "Expense" + month + year,
    amount: 100,
    date: Timestamp.fromDate(date),
    account_id: randomAccount.id,
    category_id: randomCategory.id,
  };
};

export const mockExpenseData: ExpenseModel[] = [];
for (let year = 2023; year <= 2024; year++) {
  for (let month = 0; month < 12; month += 1) {
    mockExpenseData.push(generateExpenseData(year, month));
  }
}
/* BUDGET --------------------------------------------------------------------------------*/

const generateBudgetItemsData = (year: number, month: number, idPrefix: string) => {
  const date = new Date(year, month, 1);
  return {
    id: uuidv4(),
    category_id: "cat3",
    amount: 300,
    date: Timestamp.fromDate(date),
  };
};

export const mockBudgetData: BudgetModel[] = [];
for (let year = 2023; year <= 2024; year++) {
  for (let month = 0; month < 12; month += 1) {
    const budgetItems: BudgetItemsModel[] = [];
    for (let i = 0; i < 3; i++) {
      budgetItems.push(generateBudgetItemsData(year, month, `budgetItem${i}`));
    }
    mockBudgetData.push({
      id: `budget${year}${month}`,
      budgets: budgetItems,
      monthYear: `${year}-${month + 1}`,
      timeframe: "Monthly",
      lastModified: Timestamp.now(),
    });
  }
}
/* INCOME --------------------------------------------------------------------------------*/

const generateIncomeData = (year: number, month: number) => {
  const randomAccount = getRandomElement(accountsWithIds);
  const randomIncomeSource = getRandomElement(incomeSourceWithIds);
  const date = new Date(year, month, 1);
  return {
    id: uuidv4(),
    category_id: randomIncomeSource.id,
    amount: 200,
    date: Timestamp.fromDate(date),
    description: "Income" + month + year,
    account_id: randomAccount.id,
  };
};

export const mockIncomeData: IncomeModel[] = [];
for (let year = 2023; year <= 2024; year++) {
  for (let month = 0; month < 12; month += 1) {
    mockIncomeData.push(generateIncomeData(year, month));
  }
}
/* SAVINGS -------------------------------------------------------------------------------*/

const generateSavingGoalsData = (year: number, month: number) => {
  const date = new Date(year, month, 1);

  return {
    id: uuidv4(),
    description: "Savings" + month + year,
    notes: "Save for a vacation",
    targetAmount: 5000,
    currentAmount: 1000,
    icon: "icon1",
    color: "blue",
    startDate: Timestamp.fromDate(date),
    endDate: Timestamp.fromDate(new Date(year, month + 1, 1)),
    status: "Active",
    autoContributionAmount: 100,
    contributionFrequency: "Weekly",
    autoContributionStatus: 1,
  };
};

export const mockSavingGoalsData: SavingGoalsModel[] = [];
for (let year = 2023; year <= 2024; year++) {
  for (let month = 0; month < 12; month += 1) {
    mockSavingGoalsData.push(generateSavingGoalsData(year, month));
  }
}

/* Contributions -------------------------------------------------------------------------------*/

const generateSavingGoalsContributionsData = (year: number, month: number) => {
  const date = new Date(year, month, 1);
  const randomAccount = getRandomElement(accountsWithIds);

  return {
    id: uuidv4(),
    savingsId: uuidv4(),
    amount: 45,
    date: Timestamp.fromDate(date),
    account_id: randomAccount.id,
    lastModified: Timestamp.fromDate(date),
    deleted: false,
  };
};

export const mockSavingsContributionsData: SavingGoalsContributionModel[] = [];
for (let year = 2023; year <= 2024; year++) {
  for (let month = 0; month < 12; month += 1) {
    mockSavingsContributionsData.push(generateSavingGoalsContributionsData(year, month));
  }
}
