import { sumDataByTimeframe } from "../GenericTransactionHelper";

/* eslint-disable no-restricted-globals */
self.onmessage = (event) => {
  const { action, payload } = event.data;

  switch (action) {
    case "TXN_SUM":
      const { txnData, dateProperty, amountProperty, timeframe, dateStart, dateEnd } = payload;
      const res = sumDataByTimeframe(txnData, dateProperty, amountProperty, timeframe, dateStart, dateEnd);
      self.postMessage(res);
      break;
    default:
      self.postMessage("Unknown action");
  }
};
