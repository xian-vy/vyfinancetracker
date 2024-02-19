import { FilterTimeframe, monthFilters, weekFilters } from "../constants/timeframes";
import IncomeModel from "../models/IncomeModel";
import IncomeSourcesModel from "../models/IncomeSourcesModel";
import { GroupData, GroupDataByCategory, filterDataByDateRange } from "./GenericTransactionHelper";
import { getDateFormat } from "./date";

interface FilteredItem {
  date: string;
  totalAmount: number;
  category?: string;
}
export const FilterAndGroupIncome = (
  filterOption: string,
  incomes: IncomeModel[],
  incomeSource: IncomeSourcesModel[],
  dateStart?: Date,
  dateEnd?: Date,
  groupbyCategory?: boolean
): FilteredItem[] => {
  const isMonth = monthFilters.includes(filterOption as FilterTimeframe);

  const isWeek = weekFilters.includes(filterOption as FilterTimeframe);

  const filteredIncome = filterDataByDateRange(incomes, "date", filterOption, dateStart, dateEnd);
  const mappedItems = filteredIncome.map((item) => ({
    date: item.date,
    category_id: item.category_id,
    amount: item.amount,
  }));

  if (groupbyCategory) {
    return GroupDataByCategory(mappedItems, getDateFormat(filterOption), incomeSource, isMonth, isWeek);
  } else {
    return GroupData(mappedItems, getDateFormat(filterOption), isMonth, isWeek);
  }
};
