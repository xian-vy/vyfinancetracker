import { generateAccountsBalances } from "../AccountHelper";

/* eslint-disable no-restricted-globals */
self.onmessage = (event: MessageEvent) => {
  const { action, payload } = event.data;

  switch (action) {
    case "ACCOUNT_BALANCES":
      const { incomeData, expenseData, contributionData, accounts } = payload;
      const res = generateAccountsBalances(incomeData, expenseData, contributionData, accounts);
      self.postMessage(res);
      break;
    default:
      self.postMessage("Unknown action");
  }
};
