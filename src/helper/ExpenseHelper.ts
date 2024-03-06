import { FilterTimeframe, monthFilters, weekFilters } from "../constants/timeframes";
import CategoryModel from "../models/CategoryModel";
import ExpenseModel from "../models/ExpenseModel";
import { GroupData, GroupDataByCategory, filterDataByDateRange } from "./GenericTransactionHelper";
import { getDateFormat } from "./date";

interface FilteredItem {
  date: string;
  totalAmount: number;
  category?: string;
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
export const FilterAndGroupExpense = (
  filterOption: string,
  expenses: ExpenseModel[],
  categories: CategoryModel[],
  dateStart?: Date,
  dateEnd?: Date,
  groupbyCategory?: boolean
): FilteredItem[] => {
  const isMonth = monthFilters.includes(filterOption as FilterTimeframe);

  const isWeek = weekFilters.includes(filterOption as FilterTimeframe);

  const filteredExpense = filterDataByDateRange(expenses, "date", filterOption, dateStart, dateEnd);

  const mappedItems = filteredExpense.map((item) => ({
    date: item.date,
    category_id: item.category_id,
    amount: item.amount,
  }));

  if (groupbyCategory) {
    return GroupDataByCategory(mappedItems, getDateFormat(filterOption), categories, isMonth, isWeek);
  } else {
    return GroupData(mappedItems, getDateFormat(filterOption), isMonth, isWeek);
  }
};
