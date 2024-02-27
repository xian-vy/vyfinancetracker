import { FilterTimeframe } from "../../constants/timeframes";
import { getDateFormat, sortDates } from "../../helper/date";

interface FilteredItem {
  date: string;
  totalAmount: number;
  category?: string;
}

//For dashboard all txn trend charts
export const FilterAndGroupAllTransactions = (
  expenses: FilteredItem[],
  income: FilteredItem[],
  budgets: FilteredItem[],
  savingscontributions: FilteredItem[],
  filterOption: FilterTimeframe
) => {
  // Create a new array that contains all unique dates from expenses, budgets, income, and contributions
  const allDates = Array.from(
    new Set([...expenses, ...budgets, ...income, ...savingscontributions].map((item) => item.date)) // Add contributions here
  );

  const result = allDates.map((date) => {
    const expenseItem = expenses.find((expense) => expense.date === date);
    const budgetItem = budgets.find((budget) => budget.date === date);
    const incomeItem = income.find((inc) => inc.date === date);
    const contributionItem = savingscontributions.find((contribution) => contribution.date === date);

    const totalExpense = expenseItem ? expenseItem.totalAmount : 0;
    const totalIncome = incomeItem ? incomeItem.totalAmount : 0;
    const totalContribution = contributionItem ? contributionItem.totalAmount : 0;
    const totalBudget = budgetItem ? budgetItem.totalAmount : 0;

    return {
      date: date,
      totalExpense: totalExpense,
      totalBudget: totalBudget,
      totalIncome: totalIncome,
      totalContribution: totalContribution,
      balance: totalIncome - totalExpense - totalContribution,
    };
  });

  const dateFormat = getDateFormat(filterOption);

  return sortDates(result, filterOption, dateFormat);
};
