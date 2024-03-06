import { FilterTimeframe, monthFilters, weekFilters } from "../constants/timeframes";
import { getSavingsDetails, getAccountsDetails } from "../firebase/utils";
import AccountTypeModel from "../models/AccountTypeModel";
import SavingGoalsContributionModel from "../models/SavingGoalsContribution";
import SavingGoalsModel from "../models/SavingGoalsModel";
import { GroupData, GroupDataByCategory, filterDataByDateRange } from "./GenericTransactionHelper";
import { getDateFormat, sortDates } from "./date";

interface FilteredItem {
  date: string;
  totalAmount: number;
  category?: string;
}
//For reporrts trends of all txn
export const FilterAndGroupSavingsContribution = (
  filterOption: string,
  contributions: SavingGoalsContributionModel[],
  dateStart?: Date,
  dateEnd?: Date,
  savings?: SavingGoalsModel[],
  groupbyCategory?: boolean
): FilteredItem[] => {
  const isMonth = monthFilters.includes(filterOption as FilterTimeframe);

  const isWeek = weekFilters.includes(filterOption as FilterTimeframe);
  // "date" is prop for generic date since date field can be different for all data model
  const filteredItems = filterDataByDateRange(contributions, "date", filterOption, dateStart, dateEnd);

  const mappedItems = filteredItems.map((item) => ({
    date: item.date,
    category_id: item.savingsId,
    amount: item.amount,
  }));

  if (groupbyCategory && savings) {
    return GroupDataByCategory(mappedItems, getDateFormat(filterOption), savings, isMonth, isWeek);
  } else {
    return GroupData(mappedItems, getDateFormat(filterOption), isMonth, isWeek);
  }
};

//For bar chart (no date in display)
export function GroupSavingsWithContributions(
  savings: SavingGoalsModel[],
  savingsContributions: SavingGoalsContributionModel[]
) {
  const groupedData = savings.reduce((accumulator, saving) => {
    const { color, categoryIcon, description } = getSavingsDetails(savings, saving.id);

    const amount = savingsContributions
      .filter((contribution) => contribution.savingsId === saving.id)
      .reduce((sum, contribution) => sum + contribution.amount, 0);

    if (description) {
      accumulator[description] = accumulator[description] || {
        category: description,
        amount: 0,
        color: color,
        icon: categoryIcon?.icon,
      };
      accumulator[description].amount += amount;
    }

    return accumulator;
  }, {} as { [key: string]: { category: string; amount: number; color: string; icon: React.ReactElement } });

  return groupedData;
}
export function GroupSavingsWithContributionsByAccountType(
  savings: SavingGoalsModel[],
  savingsContributions: SavingGoalsContributionModel[],
  accounType: AccountTypeModel[]
) {
  const groupedData = savings.reduce((accumulator, saving) => {
    const contributions = savingsContributions.filter((contribution) => contribution.savingsId === saving.id);

    contributions.forEach((contribution) => {
      const { color, categoryIcon, description } = getAccountsDetails(accounType, contribution.account_id);

      if (description) {
        accumulator[description] = accumulator[description] || {
          category: description,
          amount: 0,
          color: color,
          icon: categoryIcon?.icon,
        };
        accumulator[description].amount += contribution.amount;
      }
    });

    return accumulator;
  }, {} as { [key: string]: { category: string; amount: number; color: string; icon: React.ReactElement } });

  return groupedData;
}

type ContributionResultItem = {
  description: string | undefined;
  color: string;
  contributionTotal: number;
};

type ContributionResult = {
  date: string;
  SavingsItems: ContributionResultItem[];
};

export const FilterAndGroupContributions = (
  contributions: FilteredItem[],
  savings: SavingGoalsModel[],
  filterOption: FilterTimeframe
): ContributionResult[] => {
  const allDates = Array.from(new Set(contributions.map((item) => item.date)));

  const result = allDates.map((date) => {
    const contributionsOnDate = contributions.filter((contribution) => contribution.date === date);

    const savingsOnDate = Array.from(new Set(contributionsOnDate.map((item) => item.category)));

    const SavingsItems = savingsOnDate.map((description) => {
      const savingsItem = savings.find((item) => item.description === description);
      const color = savingsItem ? savingsItem.color : "";
      const savingsContributions = contributionsOnDate.filter((contribution) => contribution.category === description);

      return {
        description,
        color,
        contributionTotal: savingsContributions.reduce((sum, contribution) => sum + contribution.totalAmount, 0),
      };
    });

    return {
      date,
      SavingsItems,
    };
  });

  const dateFormat = getDateFormat(filterOption);

  return sortDates(result, filterOption, dateFormat);
};
