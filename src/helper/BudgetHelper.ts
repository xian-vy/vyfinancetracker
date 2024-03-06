import {
  differenceInDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  getYear,
  parse,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { Timestamp } from "firebase/firestore";
import { FilterTimeframe, dayFilters, monthFilters, weekFilters, yearFilters } from "../constants/timeframes";
import { BudgetItemsModel, BudgetModel } from "../models/BudgetModel";
import CategoryModel from "../models/CategoryModel";
import { GroupData, GroupDataByCategory } from "./GenericTransactionHelper";
import { getDateFormat, getStartAndEndDate } from "./date";

type FilteredItem = {
  date: string;
  totalAmount: number;
  category?: string;
};

export function distributeBudgetAmounts(
  budgets: BudgetModel[],
  filterOption: FilterTimeframe,
  dateStart?: Date,
  dateEnd?: Date,
  filterByDate?: boolean // transction summary SUM  needs this function to be unfiltered
) {
  const { startDate, endDate } = getStartAndEndDate(filterOption, dateStart, dateEnd);

  let filterdBudgets = budgets;

  // for all budget filters except dashboard transction summary SUM
  //because dashboard transction summary SUM requires data to be unfiltered since its also fetching data from
  // previous dates
  if (filterByDate) {
    if (monthFilters.includes(filterOption) || dayFilters.includes(filterOption)) {
      filterdBudgets = budgets.filter((budget) => {
        const monthStart = startOfMonth(parse(budget.monthYear, "MMMM yyyy", new Date()));
        const monthEnd = endOfMonth(monthStart);
        return startDate >= monthStart && endDate <= monthEnd;
      });
    } else if (yearFilters.includes(filterOption)) {
      filterdBudgets = budgets.filter((budget) => {
        const budgetYear = getYear(parse(budget.monthYear, "MMMM yyyy", new Date()));
        const startYear = getYear(startDate);

        return budgetYear === startYear;
      });
    } else {
      //All Time and WeekFilters (since theres no way to filter week here, do the filtering below)
      filterdBudgets = budgets;
    }
  }

  let budgetItems: BudgetItemsModel[];

  if (monthFilters.includes(filterOption)) {
    budgetItems = filterdBudgets.flatMap((budget) => {
      type WeekRange = { weekStart: Date; weekEnd: Date };

      const monthStart = startOfMonth(parse(budget.monthYear, "MMMM yyyy", new Date()));
      const monthEnd = endOfMonth(monthStart);
      const totalDaysInMonth = differenceInDays(monthEnd, monthStart) + 1;
      const weeks: WeekRange[] = [];
      for (let weekStartDay = 1; weekStartDay <= totalDaysInMonth; weekStartDay += 7) {
        let weekStart = new Date(monthStart.getFullYear(), monthStart.getMonth(), weekStartDay);
        let weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);

        // If weekEnd is beyond the monthEnd, adjust it to the last day of the month
        if (weekEnd > monthEnd) {
          weekEnd = monthEnd;
        }

        weeks.push({ weekStart, weekEnd });
      }

      return weeks
        .map(({ weekStart, weekEnd }) => {
          const daysInWeek = differenceInDays(weekEnd, weekStart) + 1;
          const amountPerDay = budget.budgets.map((item) => item.amount / totalDaysInMonth);
          const amountForWeek = amountPerDay.map((perDay) => perDay * daysInWeek);

          return budget.budgets.map((item, index) => ({
            ...item,
            amount: amountForWeek[index],
            date: Timestamp.fromDate(weekStart),
          }));
        })
        .flat();
    });
  } else if (weekFilters.includes(filterOption)) {
    budgetItems = filterdBudgets.flatMap((budget) => {
      //console.log(budget.budgets);
      // Find the week interval that matches the startDate and endDate
      const weekStart = startOfWeek(startDate, { weekStartsOn: 0 });
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 0 });
      const daysOfWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

      return budget.budgets.flatMap((item) => {
        // Calculate the amount per day for this budget item
        const monthStart = startOfMonth(parse(budget.monthYear, "MMMM yyyy", new Date()));
        const monthEnd = endOfMonth(monthStart);
        const totalDaysInMonth = differenceInDays(monthEnd, monthStart) + 1;
        const amountPerDay = item.amount / totalDaysInMonth;
        const amountForWeekDay = amountPerDay * daysOfWeek.length;

        return daysOfWeek.map((day) => {
          return {
            id: item.id, // Ensure the id is included
            category_id: item.category_id, // Ensure the category_id is included
            amount: amountForWeekDay / daysOfWeek.length,
            date: Timestamp.fromDate(day),
          };
        });
      });
    });
  } else if (dayFilters.includes(filterOption)) {
    budgetItems = filterdBudgets.flatMap((budgetItem) => {
      const monthStart = startOfMonth(parse(budgetItem.monthYear, "MMMM yyyy", new Date()));
      const monthEnd = endOfMonth(monthStart);
      const totalDaysInMonth = differenceInDays(monthEnd, monthStart) + 1;

      return budgetItem.budgets.map((item) => {
        const amountPerDay = item.amount / totalDaysInMonth;

        return {
          ...item,
          amount: amountPerDay,
          date: Timestamp.fromDate(startDate),
        };
      });
    });
  } else {
    budgetItems = filterdBudgets.flatMap((budget) => budget.budgets);
    //   console.log("year", budgetItems);
  }

  return { budgetItems };
}
export const filterBudgetByDateRange = (
  budgets: BudgetModel[],
  filterOption: FilterTimeframe,
  dateStart?: Date,
  dateEnd?: Date
) => {
  const { budgetItems } = distributeBudgetAmounts(budgets, filterOption, dateStart, dateEnd, true);
  return { budgetItems };
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
export const FilterAndGroupBudget = (
  filterOption: FilterTimeframe,
  budgets: BudgetModel[],
  categories: CategoryModel[],
  dateStart?: Date,
  dateEnd?: Date,
  groupbyCategory?: boolean
): FilteredItem[] => {
  const isMonth = monthFilters.includes(filterOption);
  const isWeek = weekFilters.includes(filterOption);
  const { budgetItems } = filterBudgetByDateRange(budgets, filterOption, dateStart, dateEnd);
  if (groupbyCategory) {
    return GroupDataByCategory(budgetItems, getDateFormat(filterOption), categories, isMonth, isWeek);
  } else {
    return GroupData(budgetItems, getDateFormat(filterOption), isMonth, isWeek);
  }
};
