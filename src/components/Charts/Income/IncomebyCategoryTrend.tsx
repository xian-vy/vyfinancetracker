import React, { useEffect, useMemo, useState } from "react";
import { getFilterTitle } from "../../../helper/utils";
import { GroupTransactionByDateAndCategoriesWorker } from "../../../helper/workers/workerHelper";
import { FilterTimeframe, yearFilters } from "../../../constants/timeframes";
import { txn_types } from "../../../constants/collections";
import { useIncomeSourcesContext } from "../../../contextAPI/IncomeSourcesContext";
import { useFilterHandlers } from "../../../hooks/filterHook";
import IncomeModel from "../../../models/IncomeModel";
import CustomMonthFilter from "../../Filter/CustomMonthFilter";
import CustomYearFilter from "../../Filter/CustomYearFilter";
import FilterIncomeSavingsTrend from "../../Filter/FilterIncomeSavingsTrend";
import TrendByCategoryChart from "../TrendByCategoryChart";
import { FilterAndGroupData } from "../../../helper/GenericTransactionHelper";

type chartDataType = {
  date: string;
  categories: {
    category: string | undefined;
    total: number;
    color: string;
  }[];
};

interface ExpenseTrendProps {
  incomes: IncomeModel[];
  onDateFilterChange: (filterOption: FilterTimeframe, startDate: Date | undefined, endDate: Date | undefined) => void;
}

const IncomebyCategoryTrend: React.FC<ExpenseTrendProps> = ({ incomes, onDateFilterChange }) => {
  const {
    filterOption,
    customMonthOpen,
    customYearOpen,
    startDate,
    endDate,
    handleFilterOptionChange,
    handleCloseForm,
    handleYearFilter,
    handleMonthFilter,
  } = useFilterHandlers();

  useEffect(() => {
    onDateFilterChange(filterOption, startDate || undefined, endDate || undefined);
  }, [handleFilterOptionChange]);

  const { incomeSource } = useIncomeSourcesContext();
  const worker = useMemo(
    () => new Worker(new URL("../../../helper/workers/trendChartWorker", import.meta.url)),
    [incomes]
  );

  const filteredIncome = useMemo(
    () => FilterAndGroupData(filterOption, incomes, incomeSource, startDate || undefined, endDate || undefined, true),
    [filterOption, incomes, incomeSource, startDate, endDate]
  );

  const [chartData, setChartData] = useState<chartDataType[] | undefined>(undefined);

  // necessary to populate/do worker function on first load
  useEffect(() => {
    return () => {
      worker.terminate();
    };
  }, [worker]);

  useEffect(() => {
    let isMounted = true;
    GroupTransactionByDateAndCategoriesWorker(worker, filteredIncome, incomeSource, filterOption).then((data) => {
      if (isMounted) {
        setChartData(data as chartDataType[]);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [filteredIncome, incomeSource, filterOption]);

  const allIncomeSources = Array.from(
    new Set(chartData?.flatMap((item) => item.categories.map((source) => source.category)))
  );
  const formattedFilterOption = getFilterTitle(filterOption, startDate, endDate);
  const includeDateFilter = yearFilters.includes(filterOption);

  const totalAmount =
    chartData
      ?.flatMap((item) => item.categories)
      .reduce((acc: number, curr: { total: number }) => acc + curr.total, 0) || 0;
  return (
    <>
      <FilterIncomeSavingsTrend
        title="Income"
        timeframe={formattedFilterOption}
        onFilterChange={handleFilterOptionChange}
        filterOption={filterOption}
        startDate={startDate}
        endDate={endDate}
        totalAmount={totalAmount}
        txnType={txn_types.Income}
      />

      <TrendByCategoryChart
        filteredChartData={chartData || undefined}
        allCategories={allIncomeSources}
        formattedFilterOption={formattedFilterOption}
        type={txn_types.Income}
        includeDateFilter={includeDateFilter}
      />

      <CustomMonthFilter isFormOpen={customMonthOpen} closeForm={handleCloseForm} onFormSubmit={handleMonthFilter} />
      <CustomYearFilter isFormOpen={customYearOpen} closeForm={handleCloseForm} onFormSubmit={handleYearFilter} />
    </>
  );
};

export default React.memo(IncomebyCategoryTrend);
