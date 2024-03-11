import { useEffect, useMemo, useState } from "react";
import { FilterTimeframe } from "../constants/timeframes";
import { CategoriesType, FilteredItem } from "../helper/GenericTransactionHelper";
import { GroupTransactionByDateAndCategoriesWorker } from "../helper/workers/workerHelper";

type CHART_RESULT_TYPE = {
  date: string;
  categories: {
    category: string | undefined;
    total: number;
    color: string;
  }[];
};

interface Props<T> {
  transactionData: FilteredItem[];
  categories: T[];
  selectedCategory?: string[];
  selectedTimeframe: FilterTimeframe;
  filterByCategory?: boolean;
}

const useTrendByCategoryChart = <T extends CategoriesType>({
  transactionData,
  categories,
  selectedCategory,
  selectedTimeframe,
  filterByCategory = true,
}: Props<T>) => {
  const worker = useMemo(() => new Worker(new URL("../helper/workers/workers", import.meta.url)), [transactionData]);

  const [chartData, setChartData] = useState<CHART_RESULT_TYPE[] | undefined>(undefined);

  useEffect(() => {
    return () => {
      worker.terminate();
    };
  }, [worker]);

  useEffect(() => {
    let isMounted = true;
    GroupTransactionByDateAndCategoriesWorker(worker, transactionData, categories, selectedTimeframe).then((data) => {
      if (isMounted) {
        setChartData(data as CHART_RESULT_TYPE[]);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [transactionData, categories, selectedTimeframe]);

  const filteredChartData = useMemo(() => {
    if (chartData) {
      if (!filterByCategory) {
        //for income/savings no category filter
        return chartData;
      }

      if (selectedCategory && selectedCategory.includes("All Categories")) {
        return chartData;
      }
      return chartData
        .map((data) => ({
          ...data,
          categories: data.categories.filter(
            (category) => selectedCategory && selectedCategory.includes(category.category || "")
          ),
        }))
        .filter((data) => data.categories.length > 0);
    }
  }, [chartData, selectedCategory]);

  const allCategories = Array.from(
    new Set(filteredChartData?.flatMap((data) => data.categories.map((category) => category.category)))
  );

  const totalAmount = useMemo(() => {
    return (
      filteredChartData
        ?.flatMap((item) => item.categories)
        .reduce((acc: number, curr: { total: number }) => acc + curr.total, 0) || 0
    );
  }, [filteredChartData]);

  return { filteredChartData, allCategories, totalAmount };
};

export default useTrendByCategoryChart;
