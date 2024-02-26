import { GroupTransactionByDateAndCategories } from "../GenericTransactionHelper";

/* eslint-disable no-restricted-globals */
self.onmessage = (event) => {
  const { action, payload } = event.data;

  switch (action) {
    case "TREND_CHART":
      const { filteredExpenses, categories, filterOption } = payload;
      const res = GroupTransactionByDateAndCategories(filteredExpenses, categories, filterOption);
      self.postMessage(res);
      break;
    default:
      self.postMessage("Unknown action");
  }
};
