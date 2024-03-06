import { compareAsc, format, parse } from "date-fns";
import { FilterTimeframe, monthFilters, weekFilters } from "../constants/timeframes";
import { getCategoryAndAccountTypeDescription, getCategoryDetails } from "../firebase/utils";
import AccountTypeModel from "../models/AccountTypeModel";
import CategoryModel from "../models/CategoryModel";
import ExpenseModel from "../models/ExpenseModel";
import IncomeModel from "../models/IncomeModel";
import IncomeSourcesModel from "../models/IncomeSourcesModel";
import { getDateFormat } from "./date";
import { formatNumberWithoutCurrency } from "./utils";

interface DataRow {
  category: string;
  [key: string]: any;
}

interface filteredData {
  date: string;
  totalAmount: number;
  category?: string;
}
export function generateSingleReport(filteredData: filteredData[], filterOption: FilterTimeframe) {
  if (!filteredData || filteredData.length === 0) {
    return { combinedDataWithTotal: [], columns: [] };
  }

  const dates = Array.from(new Set(filteredData.map((item: any) => item.date)));
  if (monthFilters.includes(filterOption)) {
    dates.sort((a, b) => {
      const dayA = parseInt(a.split(" - ")[0].split(" ")[1]);
      const dayB = parseInt(b.split(" - ")[0].split(" ")[1]);
      return dayA - dayB;
    });
  } else if (weekFilters.includes(filterOption)) {
    dates.sort((a, b) => {
      const dayA = a.split(" - ")[0];
      const dayB = b.split(" - ")[0];
      const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      return daysOfWeek.indexOf(dayA) - daysOfWeek.indexOf(dayB);
    });
  } else {
    const dateFormat = getDateFormat(filterOption);

    dates.sort((a, b) => {
      const dateA = parse(a, dateFormat, new Date());
      const dateB = parse(b, dateFormat, new Date());
      return compareAsc(dateA, dateB);
    });
  }

  const transformedExpenseData = filteredData.reduce<DataRow[]>((acc, cur, index) => {
    const existingCategory = acc.find((item) => item.category === cur.category);
    if (existingCategory) {
      existingCategory[cur.date] = cur.totalAmount || 0;
      existingCategory.totalAmount = (existingCategory.totalAmount || 0) + (cur.totalAmount || 0);
    } else {
      acc.push({
        category: cur.category || "",
        [cur.date]: cur.totalAmount || 0,
        totalAmount: cur.totalAmount || 0,
      });
    }
    return acc;
  }, []);

  // Calculate the total for each date
  const totalExpensePerDate = dates.reduce((acc, date) => {
    acc[date] = transformedExpenseData.reduce((sum, row) => sum + (row[date] || 0), 0);
    return acc;
  }, {} as { [key: string]: number });

  const totalExpenseAmountPerCategory = transformedExpenseData.reduce((sum, row) => sum + row.totalAmount, 0);

  const combinedDataWithTotal = [
    ...transformedExpenseData,
    {
      category: "Total",
      totalAmount: totalExpenseAmountPerCategory,
      ...totalExpensePerDate,
    },
  ];
  const columns = [
    {
      field: "category",
      headerName: "Category",
      sortable: false,
    },
    ...dates.map((date) => ({
      field: date,
      headerName: date,
      type: "number",
      sortable: false,
    })),
    {
      field: "totalAmount",
      headerName: "Total",
      type: "number",
      sortable: false,
    },
  ];
  return { combinedDataWithTotal, columns };
}

export async function generateExpenseList(
  expenseData: ExpenseModel[],
  categories: CategoryModel[],
  accounts: AccountTypeModel[],
  filterDate: string
) {
  if (expenseData.length === 0) {
    return;
  }
  const xlsx = await import("xlsx/dist/xlsx.mini.min.js");
  const utils = xlsx.utils;
  const writeFile = xlsx.writeFile;

  const data = expenseData.map((expense) => {
    const { description: categoryDescription } = getCategoryDetails(categories, expense.category_id);
    const account = getCategoryAndAccountTypeDescription(expense.account_id, accounts);
    const date = format(expense.date.toDate(), "MMMM dd, yyyy 'at' hh:mm:ss a");
    const amount = formatNumberWithoutCurrency(expense.amount);
    const description = expense.description;
    return {
      description,
      amount,
      date,
      account: account,
      category: categoryDescription,
    };
  });

  const columnOrder = Object.keys(data[0]);

  const ws = utils.json_to_sheet(data, { header: columnOrder });
  const generatedDate = `Generated-On-${format(new Date(), "yyyy-MMM-dd")}`;

  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, "Report");

  writeFile(wb, `${filterDate}-Expenses-${generatedDate}.xlsx`);
}

export async function generateIncomeList(
  incomeData: IncomeModel[],
  incomeSource: IncomeSourcesModel[],
  accounts: AccountTypeModel[],
  filterDate: string
) {
  if (incomeData.length === 0) {
    return;
  }
  const xlsx = await import("xlsx/dist/xlsx.mini.min.js");
  const utils = xlsx.utils;
  const writeFile = xlsx.writeFile;

  const data = incomeData.map((expense) => {
    const { description: categoryDescription } = getCategoryDetails(incomeSource, expense.category_id);
    const account = getCategoryAndAccountTypeDescription(expense.account_id, accounts);
    const date = format(expense.date.toDate(), "MMMM dd, yyyy 'at' hh:mm:ss a");
    const amount = formatNumberWithoutCurrency(expense.amount);
    const description = expense.description;
    return {
      description,
      amount,
      date,
      account: account,
      incomesource: categoryDescription,
    };
  });

  const columnOrder = Object.keys(data[0]);

  const ws = utils.json_to_sheet(data, { header: columnOrder });
  const generatedDate = `Generated-On-${format(new Date(), "yyyy-MMM-dd")}`;

  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, "Report");

  writeFile(wb, `${filterDate}-Income-${generatedDate}.xlsx`);
}
