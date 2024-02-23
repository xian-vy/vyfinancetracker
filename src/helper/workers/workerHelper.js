export function sumDataByTimeframeWorker(worker, txnData, dateProperty, amountProperty, timeframe, dateStart, dateEnd) {
  return new Promise((resolve, reject) => {
    worker.postMessage({
      action: "TXN_SUM",
      payload: { txnData, dateProperty, amountProperty, timeframe, dateStart, dateEnd },
    });

    worker.onmessage = (event) => {
      resolve(event.data);
    };

    worker.onerror = (error) => {
      reject(error);
    };
  });
}

export function generateAccountsBalancesWorker(worker, incomeData, expenseData, contributionData, accounts) {
  return new Promise((resolve, reject) => {
    worker.postMessage({
      action: "ACCOUNT_BALANCES",
      payload: { incomeData, expenseData, contributionData, accounts },
    });

    worker.onmessage = (event) => {
      resolve(event.data);
    };

    worker.onerror = (error) => {
      reject(error);
    };
  });
}

export function GroupTransactionByDateAndCategoriesWorker(worker, filteredExpenses, categories, filterOption) {
  return new Promise((resolve, reject) => {
    worker.postMessage({
      action: "TREND_CHART",
      payload: { filteredExpenses, categories, filterOption },
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
  worker,
  expenses,
  income,
  budgets,
  savingscontributions,
  filterOption
) {
  return new Promise((resolve, reject) => {
    worker.postMessage({
      action: "FILTER_GROUP_ALL_DATA",
      payload: {
        expenses,
        income,
        budgets,
        savingscontributions,
        filterOption,
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
