import { FilterTimeframe } from "../../constants/timeframes";
import AccountTypeModel from "../../models/AccountTypeModel";
import DebtModel from "../../models/DebtModel";
import ExpenseModel from "../../models/ExpenseModel";
import IncomeModel from "../../models/IncomeModel";
import SavingGoalsContributionModel from "../../models/SavingGoalsContribution";
import SavingGoalsModel from "../../models/SavingGoalsModel";
import { CategoriesType, FilteredItem, TransactionTypes } from "../GenericTransactionHelper";

export const WORKER_DASHBOARD_OVERVIEWSUM = "DASHBOARD_OVERVIEWSUM";
export const WORKER_DASHBOARD_ACCOUNTBALANCES = "DASHBOARD_ACCOUNTBALANCES";
export const WORKER_TREND_BY_CATEGORY = "TREND_BY_CATEGORY";
export const WORKER_TREND_ALL_TRANSACTION = "TREND_ALL_TRANSACTION";

export function sumDataByTimeframeWorker<T extends Exclude<TransactionTypes, SavingGoalsModel>>(
  worker: Worker,
  txnData: T[],
  timeframe: FilterTimeframe,
  dateStart?: Date,
  dateEnd?: Date,
) {
  return new Promise((resolve, reject) => {
    worker.postMessage({
      action: WORKER_DASHBOARD_OVERVIEWSUM,
      payload: { txnData, timeframe, dateStart, dateEnd },
    });

    worker.onmessage = (event) => {
      resolve(event.data);
    };

    worker.onerror = (error) => {
      reject(error);
    };
  });
}

export function generateAccountsBalancesWorker(
  worker: Worker,
  incomeData: IncomeModel[],
  expenseData: ExpenseModel[],
  contributionData: SavingGoalsContributionModel[],
  accounts: AccountTypeModel[],
  debtsData : DebtModel[]
) {
  return new Promise((resolve, reject) => {
    worker.postMessage({
      action: WORKER_DASHBOARD_ACCOUNTBALANCES,
      payload: { incomeData, expenseData, contributionData, accounts,debtsData },
    });

    worker.onmessage = (event) => {
      resolve(event.data);
    };

    worker.onerror = (error) => {
      reject(error);
    };
  });
}

export function GroupTransactionByDateAndCategoriesWorker<T extends CategoriesType>(
  worker: Worker,
  items: FilteredItem[],
  categoryContext: T[],
  filterOption: FilterTimeframe
) {
  return new Promise((resolve, reject) => {
    worker.postMessage({
      action: WORKER_TREND_BY_CATEGORY,
      payload: { items, categoryContext, filterOption },
    });

    worker.onmessage = (event) => {
      resolve(event.data);
    };

    worker.onerror = (error) => {
      reject(error);
    };
  });
}

export function FilterAndGroupAllTransactionsWorker(
  worker: Worker,
  expenses: FilteredItem[],
  income: FilteredItem[],
  budgets: FilteredItem[],
  savingscontributions: FilteredItem[],
  filterTimeframe: FilterTimeframe
) {
  return new Promise((resolve, reject) => {
    worker.postMessage({
      action: WORKER_TREND_ALL_TRANSACTION,
      payload: {
        expenses,
        income,
        budgets,
        savingscontributions,
        filterTimeframe,
      },
    });

    worker.onmessage = (event) => {
      resolve(event.data);
    };

    worker.onerror = (error) => {
      reject(error);
    };
  });
}
