import { endOfMonth, format } from "date-fns";
import { Timestamp } from "firebase/firestore";
import { FilterTimeframe, monthFilters, weekFilters } from "../constants/timeframes";
import { getCategoryAndAccountTypeDescription, getColorbyDescription } from "../firebase/utils";
import { BudgetItemsModel } from "../models/BudgetModel";
import DebtModel from "../models/DebtModel";
import ExpenseModel from "../models/ExpenseModel";
import IncomeModel from "../models/IncomeModel";
import SavingGoalsContributionModel from "../models/SavingGoalsContribution";
import SavingGoalsModel from "../models/SavingGoalsModel";
import { TimestamptoDate, getDateFormat, getPreviousTimeframe, getStartAndEndDate, sortDates } from "./date";

//same types for categories,payments,accounts and income source
export type CategoriesType = {
  id: string;
  description: string;
  color: string;
  icon: string;
};

export type TransactionTypes =
  | ExpenseModel
  | IncomeModel
  | BudgetItemsModel
  | SavingGoalsModel
  | SavingGoalsContributionModel
  | DebtModel

/* First Aggregation --------------------------------------------*/
export const filterDataByDateRange = <T extends TransactionTypes>(
  txnData: T[],
  dateProperty: keyof T,
  timeframe: string,
  dateStart?: Date,
  dateEnd?: Date
): T[] => {
  const { startDate, endDate } = getStartAndEndDate(timeframe, dateStart, dateEnd);

  switch (timeframe) {
    case FilterTimeframe.AllTime:
      return txnData;
    default:
      return txnData.filter((data) => {
        const date = (data[dateProperty] as Timestamp).toDate();
        return date >= startDate && date <= endDate;
      });
  }
};

type GroupDataType = {
  date: Timestamp;
  category_id: string;
  amount: number;
};
function fortmatDateBaseOnTimeframe<T extends Partial<GroupDataType>>(
  data: T,
  dateFormat: string,
  isMonth?: boolean,
  isWeek?: boolean
): string {
  if (!data.date) {
    console.error("Error, no data defined");
    return "";
  }
  if (isMonth) {
    const jsDate = data.date.toDate();
    const monthStart = new Date(jsDate.getFullYear(), jsDate.getMonth(), 1);
    const monthEnd = endOfMonth(jsDate);

    // Calculate the week number within the month (1-5)
    const weekNumber = Math.ceil(jsDate.getDate() / 7);

    let weekStart = new Date(monthStart);
    weekStart.setDate((weekNumber - 1) * 7 + 1); // Set to the first day of the week
    let weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6); // Set to the last day of the week

    // If weekEnd is beyond the monthEnd, adjust it to the last day of the month
    if (weekEnd > monthEnd) {
      weekEnd = monthEnd;
    }

    return `${format(weekStart, "MMM dd")} - ${format(weekEnd, "dd")}`;
  } else if (isWeek) {
    const jsDate = data.date.toDate();

    return `${format(jsDate, "eee")} - ${format(jsDate, "d")}`;
  } else {
    return TimestamptoDate(data.date, dateFormat);
  }
}

/* 2nd aggregation Without Category-------------------------------------------*/

export function GroupData<T extends Partial<GroupDataType>>(
  txnData: T[],
  dateFormat: string,
  isMonth?: boolean,
  isWeek?: boolean
) {
  const groupedData: {
    [key: string]: T[];
  } = {};

  txnData.forEach((data) => {
    const formattedDate = fortmatDateBaseOnTimeframe(data, dateFormat, isMonth, isWeek);

    if (!groupedData[formattedDate]) {
      groupedData[formattedDate] = [];
    }

    groupedData[formattedDate].push(data);
  });

  return Object.entries(groupedData).map(([formattedDate, amounts]) => ({
    date: formattedDate,
    totalAmount: amounts.reduce((total, data) => total + (data.amount ?? 0), 0),
  }));
}

/* 2nd aggregation WithCategory -------------------------------------------*/
export function GroupDataByCategory<T extends Partial<GroupDataType>>(
  txnData: T[],
  dateFormat: string,
  sourceContext: CategoriesType[],
  isMonth?: boolean,
  isWeek?: boolean
) {
  const groupedData: {
    [key: string]: {
      [key: string]: T[];
    };
  } = {};

  txnData.forEach((data) => {
    const formattedDate = fortmatDateBaseOnTimeframe(data, dateFormat, isMonth, isWeek);

    const category = getCategoryAndAccountTypeDescription(data.category_id || "", sourceContext);
    if (!groupedData[formattedDate]) {
      groupedData[formattedDate] = {};
    }
    if (!groupedData[formattedDate][category]) {
      groupedData[formattedDate][category] = [];
    }

    groupedData[formattedDate][category].push(data);
  });

  const finalData = Object.entries(groupedData).flatMap(([formattedDate, categories]) =>
    Object.entries(categories).map(([category, amounts]) => ({
      date: formattedDate,
      category,
      totalAmount: amounts.reduce((total, data) => total + (data.amount ?? 0), 0),
    }))
  );

  return finalData;
}

// Helper function to get the ID to check against categoryIds/SavingsId ---/
// Special case for savings

function hasCategoryId<T extends object>(item: T): item is T & { category_id: string } {
  return "category_id" in item;
}

// Define a type guard to check if an item has a savingsId
function hasSavingsId<T extends object>(item: T): item is T & { savingsId: string } {
  return "savingsId" in item;
}

function getCategoryId<T extends object>(item: T): string {
  if (hasCategoryId(item)) {
    return item.category_id || "";
  } else if (hasSavingsId(item)) {
    return item.savingsId || "";
  }
  return "";
}

/* Final Aggregation --------------------------------------------*/

export const FilterAndGroupData = <T extends Exclude<TransactionTypes, SavingGoalsModel | DebtModel>>(
  filterTimeframe: string,
  data: T[],
  categories: CategoriesType[], //works with SavingGoalsModel too same fields as categories
  dateStart?: Date,
  dateEnd?: Date,
  groupbyCategory?: boolean
): FilteredItem[] => {
  const isMonth = monthFilters.includes(filterTimeframe as FilterTimeframe);
  const isWeek = weekFilters.includes(filterTimeframe as FilterTimeframe);

  const filteredData = filterDataByDateRange(data, "date", filterTimeframe, dateStart, dateEnd);

  const mappedItems = filteredData.map((item) => {
    const categoryId = getCategoryId(item);
    return {
      date: item.date,
      category_id: categoryId,
      amount: item.amount,
    };
  });

  if (groupbyCategory) {
    return GroupDataByCategory(mappedItems, getDateFormat(filterTimeframe), categories, isMonth, isWeek);
  } else {
    return GroupData(mappedItems, getDateFormat(filterTimeframe), isMonth, isWeek);
  }
};

// -----------------------for dashboard txn overview breakdown----------------------------//

type GroupedDataByIdResult = {
  category: string;
  amount: number;
  color: string;
  icon: React.ReactElement;
};

export function groupDataByIdWithIcons<T extends Exclude<TransactionTypes, SavingGoalsModel>>(
  getDetailsFunction: (categories: CategoriesType[], id: string) => any,
  categories: CategoriesType[],
  dataFilteredByTimeframe: T[],
  idKey: keyof T,
  selectedCategories?: string[]
): GroupedDataByIdResult[] {
  const filteredcategory = selectedCategories
    ? selectedCategories[0] === "All Categories"
      ? categories
      : categories.filter((item) => selectedCategories.includes(item.description))
    : categories;

  // Create a Set of category IDs for quick lookup
  const categoryIds = new Set(filteredcategory.map((item) => item.id));

  const filteredData = selectedCategories
    ? dataFilteredByTimeframe.filter((item) => categoryIds.has(getCategoryId(item)))
    : dataFilteredByTimeframe;

  return filteredData.reduce((accumulator, item) => {
    const id = item[idKey];
    const amount = item.amount;

    const { color, categoryIcon, description } = getDetailsFunction(categories, id as string);

    accumulator[description] = accumulator[description] || {
      category: description,
      amount: 0,
      color: color,
      icon: categoryIcon?.icon,
    };
    accumulator[description].amount += amount || 0;

    return accumulator;
  }, {} as GroupedDataByIdResult[]);
}

// -----------------------for dashboard overview SUM----------------------------//


export function sumDataByTimeframe<T extends Exclude<TransactionTypes, SavingGoalsModel>>(
  txnData: T[],
  timeframe: FilterTimeframe,
  dateStart?: Date,
  dateEnd?: Date,
) {
  if (timeframe === FilterTimeframe.AllTime) {
    const sum = txnData.reduce((total, item) => total + item.amount, 0);
    return { sum, prevSum: sum, prevDate: null };
  }
  //filter base on timeframe/date
  const { startDate, endDate } = getStartAndEndDate(timeframe, dateStart, dateEnd);

  const {
    startDate: prevStartDate,
    endDate: prevEndDate,
    prevDate,
  } = getPreviousTimeframe(timeframe, dateStart, dateEnd);

  const filteredData = txnData.filter((data) => {
    const date = new Date(data.date.seconds * 1000 + data.date.nanoseconds / 1e6);
    return date >= startDate && date <= endDate;
  });

  const prevFilteredData = txnData.filter((data) => {
    const date = new Date(data.date.seconds * 1000 + data.date.nanoseconds / 1e6);
    return date >= prevStartDate && date <= prevEndDate;
  });

 const sum = filteredData.reduce((total, item) => total + item.amount, 0);
 const prevSum = prevFilteredData.reduce((total, item) => total + item.amount, 0);
  
 
  return { sum, prevSum, prevDate };
}

//  calculate total sum for dashboard Balance
export const calculateTotalSum = <T extends TransactionTypes>(data: T[], amountProperty: keyof T) => {
  return data.reduce((total, item) => total + (item[amountProperty] as number), 0);
};

export function countDataByTimeframe<T extends TransactionTypes>(
  txnData: T[],
  dateProperty: keyof T,
  timeframe: string,
  dateStart?: Date,
  dateEnd?: Date
) {
  //filter base on timeframe/date
  const { startDate, endDate } = getStartAndEndDate(timeframe, dateStart, dateEnd);

  const filteredContributions = txnData.filter((data) => {
    const date = (data[dateProperty] as Timestamp).toDate();
    return date >= startDate && date <= endDate;
  });

  const count = filteredContributions.length;
  return count;
}

export interface FilteredItem {
  date: string;
  totalAmount: number;
  category?: string;
}

//For expense, budget,savings and income trend by category
export const GroupTransactionByDateAndCategories = <T extends CategoriesType>(
  filteredAndGroupedData: FilteredItem[],
  categoryContext: T[],
  filterOption: FilterTimeframe
) => {
  // Create a new array that contains all unique dates
  const allDates = Array.from(new Set(filteredAndGroupedData.map((item) => item.date)));
  const result = allDates.map((date) => {
    const itemsOnDate = filteredAndGroupedData.filter((item) => item.date === date);

    const categoriesOnDate = Array.from(new Set(itemsOnDate.map((item) => item.category)));

    const categories = categoriesOnDate.map((category) => {
      const categoryItems = itemsOnDate.filter((item) => item.category === category);

      const categoryColor = getColorbyDescription(category || "", categoryContext);

      return {
        category,
        total: categoryItems.reduce((sum, item) => sum + item.totalAmount, 0),
        color: categoryColor,
      };
    });

    return {
      date,
      categories,
    };
  });
  const dateFormat = getDateFormat(filterOption);

  return sortDates(result, filterOption, dateFormat);
};
