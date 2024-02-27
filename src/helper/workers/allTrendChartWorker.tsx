import { FilterAndGroupAllTransactions } from "../../components/Charts/AllTransactionChartHelper";

/* eslint-disable no-restricted-globals */
self.onmessage = (event) => {
  const { action, payload } = event.data;

  switch (action) {
    case "FILTER_GROUP_ALL_DATA":
      const { expenses, income, budgets, savingscontributions, filterOption } = payload;
      const result2 = FilterAndGroupAllTransactions(expenses, income, budgets, savingscontributions, filterOption);
      self.postMessage(result2);
      break;
    default:
      self.postMessage("Unknown action");
  }
};
