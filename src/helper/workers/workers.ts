import { FilterAndGroupAllTransactions } from "../../components/Charts/AllTransactionChartHelper";
import { generateAccountsBalances } from "../../components/Dashboard/BalanceByAccountTypeHelper";
import { GroupTransactionByDateAndCategories, sumDataByTimeframe } from "../GenericTransactionHelper";
import {
  WORKER_DASHBOARD_ACCOUNTBALANCES,
  WORKER_DASHBOARD_OVERVIEWSUM,
  WORKER_TREND_ALL_TRANSACTION,
  WORKER_TREND_BY_CATEGORY,
} from "./workerHelper";

/* eslint-disable no-restricted-globals */
self.onmessage = (event: MessageEvent) => {
  const { action, payload } = event.data;
  switch (action) {
    case WORKER_DASHBOARD_OVERVIEWSUM:
      const { txnData, timeframe, dateStart, dateEnd } = payload;
      const res = sumDataByTimeframe(txnData, timeframe, dateStart, dateEnd);
      self.postMessage(res);
      break;
    case WORKER_DASHBOARD_ACCOUNTBALANCES:
      const { incomeData, expenseData, contributionData, accounts, debtsData } = payload;
      const res2 = generateAccountsBalances(incomeData, expenseData, contributionData, accounts,debtsData);
      self.postMessage(res2);
      break;
    case WORKER_TREND_BY_CATEGORY:
      const { items, categoryContext, filterOption } = payload;
      const res3 = GroupTransactionByDateAndCategories(items, categoryContext, filterOption);
      self.postMessage(res3);
      break;
    case WORKER_TREND_ALL_TRANSACTION:
      const { expenses, income, budgets, savingscontributions, filterTimeframe } = payload;
      const res4 = FilterAndGroupAllTransactions(expenses, income, budgets, savingscontributions, filterTimeframe);
      self.postMessage(res4);
      break;
    default:
      self.postMessage("Unknown action");
  }
};
//Note: payload values should be identical with whats in workerHelper.ts
