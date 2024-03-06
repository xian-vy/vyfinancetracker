import { endOfMonth, format } from "date-fns";
import { Timestamp } from "firebase/firestore";
import { FilterTimeframe } from "../constants/timeframes";
import { TimestamptoDate, getDateFormat, getPreviousTimeframe, getStartAndEndDate, sortDates } from "./date";
import { getCategoryAndAccountTypeDescription, getColorbyDescription } from "../firebase/utils";

export const filterDataByDateRange = <txnModel extends { [key: string]: any }>(
  txnData: txnModel[],
  dateProperty: keyof txnModel,
  timeframe: string,
  dateStart?: Date,
  dateEnd?: Date
): txnModel[] => {
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

//for dashboard txn summary breakdown
export function groupDataByIdWithIcons(
  getDetailsFunction: (categories: any[], id: string) => any,
  categories: any[],
  data: any[],
  idKey: string,
  selectedCategories?: string[]
) {
  const filteredcategory = selectedCategories
    ? selectedCategories[0] === "All Categories"
      ? categories
      : categories.filter((item) => selectedCategories.includes(item.description))
    : categories;

  const filteredData = selectedCategories
    ? data.filter((item) => filteredcategory.some((categoryItem) => categoryItem.id === item.category_id))
    : data;

  return filteredData.reduce((accumulator, item) => {
    const id = item[idKey];
    const amount = item.amount;

    const { color, categoryIcon, description } = getDetailsFunction(categories, id);

    accumulator[description] = accumulator[description] || {
      category: description,
      amount: 0,
      color: color,
      icon: categoryIcon?.icon,
    };
    accumulator[description].amount += amount;

    return accumulator;
  }, {} as { [key: string]: { category: string; amount: number; color: string; icon: React.ReactElement } });
}

// for all txn grouping without category
export function GroupData<txnModel extends { date: Timestamp; amount: number }>(
  txnData: txnModel[],
  dateFormat: string,
  isMonth?: boolean,
  isWeek?: boolean
) {
  const groupedData: {
    [key: string]: txnModel[];
  } = {};

  txnData.forEach((data) => {
    let formatDate = "";

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

      formatDate = `${format(weekStart, "MMM dd")} - ${format(weekEnd, "dd")}`;
    } else if (isWeek) {
      const jsDate = data.date.toDate();

      formatDate = `${format(jsDate, "eee")} - ${format(jsDate, "d")}`;
    } else {
      formatDate = TimestamptoDate(data.date, dateFormat);
    }
    if (!groupedData[formatDate]) {
      groupedData[formatDate] = [];
    }

    groupedData[formatDate].push(data);
  });

  return Object.entries(groupedData).map(([formatDate, amounts]) => ({
    date: formatDate,
    totalAmount: amounts.reduce((total, data) => total + data.amount, 0),
  }));
}

// for all txn grouping with category
export function GroupDataByCategory<txnModel extends { date: Timestamp; category_id: string; amount: number }>(
  txnData: txnModel[],
  dateFormat: string,
  sourceContext: any[],
  isMonth?: boolean, // For Month Filter
  isWeek?: boolean
) {
  const groupedData: {
    [key: string]: {
      [key: string]: txnModel[];
    };
  } = {};

  txnData.forEach((data) => {
    let formatDate = "";
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

      formatDate = `${format(weekStart, "MMM dd")} - ${format(weekEnd, "dd")}`;
    } else if (isWeek) {
      const jsDate = data.date.toDate();

      formatDate = `${format(jsDate, "eee")} - ${format(jsDate, "d")}`;
    } else {
      formatDate = TimestamptoDate(data.date, dateFormat);
    }
    const category = getCategoryAndAccountTypeDescription(data.category_id, sourceContext);
    if (!groupedData[formatDate]) {
      groupedData[formatDate] = {};
    }
    if (!groupedData[formatDate][category]) {
      groupedData[formatDate][category] = [];
    }

    groupedData[formatDate][category].push(data);
  });

  const finalData = Object.entries(groupedData).flatMap(([formatDate, categories]) =>
    Object.entries(categories).map(([category, amounts]) => ({
      date: formatDate,
      category,
      totalAmount: amounts.reduce((total, data) => total + data.amount, 0),
    }))
  );

  return finalData;
}

export function filterAndGroupData() {}

export function sumDataByTimeframe<txtModel extends { [key: string]: any }>(
  txnData: txtModel[],
  dateProperty: keyof txtModel,
  amountProperty: keyof txtModel,
  timeframe: FilterTimeframe,
  dateStart?: Date,
  dateEnd?: Date
) {
  if (timeframe === FilterTimeframe.AllTime) {
    const sum = txnData.reduce((total, amount) => total + (amount[amountProperty] as number), 0);
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
    const date = new Date(
      (data[dateProperty] as Timestamp).seconds * 1000 + (data[dateProperty] as Timestamp).nanoseconds / 1e6
    );
    return date >= startDate && date <= endDate;
  });

  const prevFilteredData = txnData.filter((data) => {
    const date = new Date(
      (data[dateProperty] as Timestamp).seconds * 1000 + (data[dateProperty] as Timestamp).nanoseconds / 1e6
    );
    return date >= prevStartDate && date <= prevEndDate;
  });

  const sum = filteredData.reduce((total, amount) => total + (amount[amountProperty] as number), 0);
  const prevSum = prevFilteredData.reduce((total, amount) => total + (amount[amountProperty] as number), 0);

  return { sum, prevSum, prevDate };
}

//  calculate total sum for dashboard Balance
export const calculateTotalSum = <T extends { [key: string]: any }>(data: T[], amountProperty: keyof T) => {
  return data.reduce((total, item) => total + (item[amountProperty] as number), 0);
};

// export function countDataByTimeframe<txnModel extends { [key: string]: any }>(
//   txnData: txnModel[],
//   dateProperty: keyof txnModel,
//   timeframe: string,
//   dateStart?: Date,
//   dateEnd?: Date
// ) {
//   //filter base on timeframe/date
//   const { startDate, endDate } = getStartAndEndDate(timeframe, dateStart, dateEnd);

//   const filteredContributions = txnData.filter((data) => {
//     const date = (data[dateProperty] as Timestamp).toDate();
//     return date >= startDate && date <= endDate;
//   });

//   const count = filteredContributions.length;
//   return count;
// }

interface FilteredItem {
  date: string;
  totalAmount: number;
  category?: string;
}

//Category,Account,Income source generic model
type MaintenanceModel = {
  id: string;
  description: string;
  color: string;
  icon?: string;
};
//For expense, budget and income trend by category
export const GroupTransactionByDateAndCategories = <T extends MaintenanceModel>(
  items: FilteredItem[],
  categoryContext: T[],
  filterOption: FilterTimeframe
) => {
  // Create a new array that contains all unique dates
  const allDates = Array.from(new Set(items.map((item) => item.date)));
  const result = allDates.map((date) => {
    const itemsOnDate = items.filter((item) => item.date === date);

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
