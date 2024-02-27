import { BudgetItemsModel } from "../../models/BudgetModel";
import ExpenseModel from "../../models/ExpenseModel";

export const FilterExpenseAndBudgetbyCategory = (expenses: ExpenseModel[], budgets: BudgetItemsModel[]) => {
  const categoryTotals = new Map<string, { totalBudgetAmount: number; totalExpenseAmount: number }>();

  for (const expense of expenses) {
    const totals = categoryTotals.get(expense.category_id) || { totalBudgetAmount: 0, totalExpenseAmount: 0 };
    totals.totalExpenseAmount += expense.amount;
    categoryTotals.set(expense.category_id, totals);
  }
  for (const budget of budgets) {
    const totals = categoryTotals.get(budget.category_id) || { totalBudgetAmount: 0, totalExpenseAmount: 0 };
    totals.totalBudgetAmount += budget.amount;
    categoryTotals.set(budget.category_id, totals);
  }

  const sortedData = Array.from(categoryTotals, ([categoryId, totals]) => ({
    categoryId,
    ...totals,
  })).sort((a, b) => b.totalBudgetAmount - a.totalBudgetAmount);

  return sortedData;
};
