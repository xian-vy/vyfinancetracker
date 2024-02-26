import { format } from "date-fns";
import { FilterTimeframe } from "../constants/timeframes";
import {
  mockExpenseData,
  mockIncomeData,
  mockSavingGoalsData,
  mockSavingsContributionsData,
} from "../mocks/TransactionData";
import ExpenseModel from "../models/ExpenseModel";
import {
  GroupData,
  GroupDataByCategory,
  GroupTransactionByDateAndCategories,
  calculateTotalSum,
  filterDataByDateRange,
  sumDataByTimeframe,
} from "./GenericTransactionHelper";
import { TimestamptoDate, getPreviousTimeframe, getStartAndEndDate } from "./date";
import { v4 as uuidv4 } from "uuid";
import { mock_categories } from "../firebase/defaultData";
import { Timestamp } from "firebase/firestore";
import IncomeModel from "../models/IncomeModel";
import SavingGoalsContributionModel from "../models/SavingGoalsContribution";
import SavingGoalsModel from "../models/SavingGoalsModel";
import { getColorbyDescription, getCategoryAndAccountTypeDescription } from "../firebase/utils";

/*------------------------------------filterDataByDateRange------------------------------------------------------*/
jest.mock("./date", () => ({
  ...jest.requireActual("./date"),
  getStartAndEndDate: jest.fn().mockImplementation(),
  getPreviousTimeframe: jest.fn().mockImplementation(),
  TimestamptoDate: jest.fn(),
}));

let filteredExpenses: ExpenseModel[] = [];
let filteredIncome: IncomeModel[] = [];
let filteredSavingsGoals: SavingGoalsModel[] = [];
let filteredSavingsContributions: SavingGoalsContributionModel[] = [];

describe("Generic filterDataByDateRange function", () => {
  beforeEach(() => {
    (getStartAndEndDate as jest.Mock).mockReset();
  });

  it("should filter all data for `All Time` timeframe", () => {
    (getStartAndEndDate as jest.Mock).mockReturnValue({ startDate: new Date(0), endDate: new Date() });

    filteredExpenses = filterDataByDateRange(mockExpenseData, "date", FilterTimeframe.AllTime);
    expect(filteredExpenses).toHaveLength(mockExpenseData.length);

    filteredIncome = filterDataByDateRange(mockIncomeData, "date", FilterTimeframe.AllTime);
    expect(filteredIncome).toHaveLength(mockIncomeData.length);

    filteredSavingsGoals = filterDataByDateRange(mockSavingGoalsData, "startDate", FilterTimeframe.AllTime);
    expect(filteredSavingsGoals).toHaveLength(mockSavingGoalsData.length);

    filteredSavingsContributions = filterDataByDateRange(mockSavingsContributionsData, "date", FilterTimeframe.AllTime);
    expect(filteredSavingsGoals).toHaveLength(mockSavingGoalsData.length);
  });

  it("should filter data for `This Year` timeframe", () => {
    (getStartAndEndDate as jest.Mock).mockReturnValue({
      startDate: new Date(new Date().getFullYear(), 0, 1),
      endDate: new Date(new Date().getFullYear(), 11, 31, 23, 59, 59, 999),
    });

    // Filter the mock data to only include entries from  `This Year`
    const expectedFilteredExpenses = mockExpenseData.filter(
      (expense) => expense.date.toDate().getFullYear() === new Date().getFullYear()
    );

    const expectedFilteredIncome = mockIncomeData.filter(
      (income) => income.date.toDate().getFullYear() === new Date().getFullYear()
    );
    const expectedFilteredSavingsGoals = mockSavingGoalsData.filter(
      (goal) => goal.startDate.toDate().getFullYear() === new Date().getFullYear()
    );

    const filteredExpenses = filterDataByDateRange(mockExpenseData, "date", FilterTimeframe.Year);
    expect(filteredExpenses).toEqual(expectedFilteredExpenses);

    const filteredIncome = filterDataByDateRange(mockIncomeData, "date", FilterTimeframe.Year);
    expect(filteredIncome).toEqual(expectedFilteredIncome);

    const filteredSavingsGoals = filterDataByDateRange(mockSavingGoalsData, "startDate", FilterTimeframe.Year);
    expect(filteredSavingsGoals).toEqual(expectedFilteredSavingsGoals);

    expect(() => {
      filterDataByDateRange(mockExpenseData, "date", FilterTimeframe.Year);
      filterDataByDateRange(mockIncomeData, "date", FilterTimeframe.Year);
      filterDataByDateRange(mockSavingGoalsData, "startDate", FilterTimeframe.Year);
    }).not.toThrow();
  });
});

/** ----------------------------------------GroupData-----------------------------------------------------------*/

jest.mock("date-fns", () => ({
  ...jest.requireActual("date-fns"),
  endOfMonth: jest.fn(),
  format: jest.fn((date, formatString) => {
    const actualFormat = jest.requireActual("date-fns").format;
    return actualFormat(date, formatString);
  }),
}));

describe("Generic GroupData function", () => {
  interface MappedItem {
    date: Timestamp;
    category_id: string;
    amount: number;
  }
  let mappedItems: MappedItem[];
  beforeEach(() => {
    jest.clearAllMocks();

    mappedItems = filteredExpenses.map((item) => ({
      date: item.date,
      category_id: item.category_id,
      amount: item.amount,
    }));
  });

  (TimestamptoDate as jest.Mock).mockImplementation((timestamp, formatString) => {
    const jsDate = timestamp.toDate();
    const formattedDate = format(jsDate, formatString);
    return formattedDate;
  });

  it("should group expenses by month", () => {
    //Timeframe Year
    const groupedExpenses = GroupData(mappedItems, "MMM", false, false);
    expect(groupedExpenses).toBeDefined();
    expect(format).toHaveBeenCalled();
    expect(TimestamptoDate).toHaveBeenCalled();
  });
  it("should group expenses by week days", () => {
    //Timeframe isWeek
    const groupedExpenses = GroupData(mappedItems, "eee", false, true);
    expect(groupedExpenses).toBeDefined();
    expect(format).toHaveBeenCalled();
  });
  it("should group expenses by weeks of month", () => {
    //Timeframe isMonth
    const groupedExpenses = GroupData(mappedItems, "dd", true, false);
    expect(groupedExpenses).toBeDefined();
    expect(format).toHaveBeenCalled();
  });
});

/** ---------------------------------GroupDataByCategory------------------------------------------------------  */
jest.mock("../firebase/utils", () => ({
  getCategoryAndAccountTypeDescription: jest.fn(),
  getColorbyDescription: jest.fn(),
}));

type filteredAndGroupDataType = {
  date: string;
  totalAmount: number;
  category?: string;
};
let filteredAndGroupedExpenses: filteredAndGroupDataType[] = [];
const categoriesWithIds = mock_categories.Category.map((cat, index) => ({
  ...cat,
  id: uuidv4() + index,
}));

describe("Generic GroupDataByCategory function", () => {
  interface MappedItem {
    date: Timestamp;
    category_id: string;
    amount: number;
  }
  let mappedItems: MappedItem[];
  beforeEach(() => {
    jest.clearAllMocks();

    mappedItems = filteredExpenses.map((item) => ({
      date: item.date,
      category_id: item.category_id,
      amount: item.amount,
    }));
  });

  it("should group expenses by category and by month", () => {
    (getCategoryAndAccountTypeDescription as jest.Mock).mockReturnValue(categoriesWithIds[0].description);
    filteredAndGroupedExpenses = GroupDataByCategory(mappedItems, "MMM", categoriesWithIds, false, false);
    expect(filteredAndGroupedExpenses).toBeDefined();
  });
  it("should group expenses by category and by week days", () => {
    (getCategoryAndAccountTypeDescription as jest.Mock).mockReturnValue(categoriesWithIds[0].description);
    const groupedExpenses = GroupDataByCategory(mappedItems, "eee", categoriesWithIds, false, false);
    expect(groupedExpenses).toBeDefined();
  });
  it("should group expenses by category and by weeks of month", () => {
    (getCategoryAndAccountTypeDescription as jest.Mock).mockReturnValue(categoriesWithIds[0].description);
    const groupedExpenses = GroupDataByCategory(mappedItems, "eee", categoriesWithIds, false, false);
    expect(groupedExpenses).toBeDefined();
    expect(format).toHaveBeenCalled();
  });
});

/** ---------------------------------sumDataByTimeframe--------------------------------------------------------*/
describe("Generic sumDataByTimeframe function", () => {
  beforeEach(() => {
    (getStartAndEndDate as jest.Mock).mockReset();
    (getPreviousTimeframe as jest.Mock).mockReset();
  });
  it("should sum expenses by `All Time` timeframe", () => {
    //All Time
    const expenseSumByTimeframe = sumDataByTimeframe(filteredExpenses, "date", "amount", FilterTimeframe.AllTime);
    expect(expenseSumByTimeframe).toBeDefined();
  });

  it("should sum expenses by `This Year` timeframe", () => {
    //This Year
    (getStartAndEndDate as jest.Mock).mockReturnValue({
      startDate: new Date(new Date().getFullYear(), 0, 1),
      endDate: new Date(new Date().getFullYear(), 11, 31, 23, 59, 59, 999),
    });
    //Last Year
    (getPreviousTimeframe as jest.Mock).mockReturnValue({
      startDate: new Date(new Date().getFullYear() - 1, 0, 1),
      endDate: new Date(new Date().getFullYear() - 1, 11, 31, 23, 59, 59, 999),
    });

    const expenseSumByTimeframe = sumDataByTimeframe(filteredExpenses, "date", "amount", FilterTimeframe.Year);
    expect(getStartAndEndDate).toHaveBeenCalled();
    expect(getPreviousTimeframe).toHaveBeenCalled();
    expect(expenseSumByTimeframe).toBeDefined();
  });
});

/** ---------------------------------calculateTotalSum--------------------------------------------------------*/
describe("calculateTotalSum function", () => {
  it("should generate total net worth sum", () => {
    const totalIncome = calculateTotalSum(filteredIncome, "amount");
    const totalSavingsContribution = calculateTotalSum(filteredSavingsContributions, "amount");
    const totalExpenses = calculateTotalSum(filteredExpenses, "amount");

    const totalNetWorth = totalIncome - totalExpenses - totalSavingsContribution;
    // console.log("Networth", totalNetWorth);
    expect(totalNetWorth).toBeDefined();
  });
});

/** ---------------------------------GroupTransactionByDateAndCategories--------------------------------------*/

describe("Generic GroupTransactionByDateAndCategories function", () => {
  beforeEach(() => {
    (getColorbyDescription as jest.Mock).mockReset();
  });

  it("should group filtered transaction data by category and timeframe", () => {
    (getColorbyDescription as jest.Mock).mockReturnValue("Maroon");

    const groupByDateAndCategory = GroupTransactionByDateAndCategories(
      filteredAndGroupedExpenses,
      categoriesWithIds,
      FilterTimeframe.AllTime
    );

    //console.log("groupByDateAndCategory", JSON.stringify(groupByDateAndCategory, null, 2));
    expect(groupByDateAndCategory).toBeDefined();
  });
});
