import { useEffect } from "react";
import { sumDataByTimeframeWorker } from "../helper/workers/workerHelper";
import { FilterTimeframe } from "../constants/timeframes";
import { TransactionTypes } from "../helper/GenericTransactionHelper";
import SavingGoalsModel from "../models/SavingGoalsModel";
import DebtModel from "../models/DebtModel";

type generatedBudgets = {
  sum: number;
  prevSum: number;
  prevDate: string;
};

export const useSumDataByTimeframe = <T extends Exclude<TransactionTypes, SavingGoalsModel >>(
  worker: Worker,
  store: T[],
  setStoreData: React.Dispatch<React.SetStateAction<generatedBudgets | null>>,
  filterOption: FilterTimeframe,
  startDate: Date | undefined,
  endDate: Date | undefined,
  dependencies: any[]
) => {
  useEffect(() => {
    let isMounted = true;

    if (store.length > 0) {
      sumDataByTimeframeWorker(worker, store, filterOption, startDate || undefined, endDate || undefined).then(
        (data) => {
          if (isMounted) {
            setStoreData(data as generatedBudgets);
          }
        }
      );
    } else {
      setStoreData({ sum: 0, prevSum: 0, prevDate: "" });
    }

    return () => {
      isMounted = false;
    };
  }, dependencies);
};
