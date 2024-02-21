import { useEffect } from "react";
import { sumDataByTimeframeWorker } from "../helper/workers/workerHelper";
import { FilterTimeframe } from "../constants/timeframes";

type generatedBudgets = {
  sum: number;
  prevSum: number;
  prevDate: string;
};
export const useSumDataByTimeframe = (
  worker: Worker,
  store: any[],
  setStoreData: React.Dispatch<React.SetStateAction<generatedBudgets | null>>,
  filterOption: FilterTimeframe,
  startDate: Date | undefined,
  endDate: Date | undefined,
  deps: any[]
) => {
  useEffect(() => {
    let isMounted = true;

    if (store.length > 0) {
      sumDataByTimeframeWorker(
        worker,
        store,
        "date",
        "amount",
        filterOption,
        startDate || undefined,
        endDate || undefined
      ).then((data) => {
        if (isMounted) {
          setStoreData(data as generatedBudgets);
        }
      });
    } else {
      setStoreData({ sum: 0, prevSum: 0, prevDate: "" });
    }

    return () => {
      isMounted = false;
    };
  }, deps);
};
