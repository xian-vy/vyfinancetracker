import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { txn_types } from "../../../constants/collections";
import { FilterTimeframe, yearFilters } from "../../../constants/timeframes";
import { useCategoryContext } from "../../../contextAPI/CategoryContext";
import { FilterAndGroupData } from "../../../helper/GenericTransactionHelper";
import { getFilterTitle } from "../../../helper/utils";
import { GroupTransactionByDateAndCategoriesWorker } from "../../../helper/workers/workerHelper";
import { useFilterHandlers } from "../../../hooks/filterHook";
import { RootState } from "../../../redux/store";
import CustomMonthFilter from "../../Filter/CustomMonthFilter";
import CustomYearFilter from "../../Filter/CustomYearFilter";
import FilterBudgetExpenseTrend from "../../Filter/FilterBudgetExpenseTrend";
import TrendByCategoryChart from "../TrendByCategoryChart";

type chartDataType = {
  date: string;
  categories: {
    category: string | undefined;
    total: number;
    color: string;
  }[];
};

interface Props {
  title: string;
  onCategoryChange: (categoryDescription: string[]) => void;
  onDateFilterChange: (filterOption: FilterTimeframe, startDate: Date | undefined, endDate: Date | undefined) => void;
}

const ExpensebyCategoryTrend: React.FC<Props> = ({ title, onDateFilterChange, onCategoryChange }) => {
  const expenses = useSelector((state: RootState) => state.expenses.expenses);

  const [selectedCategory, setSelectedCategory] = useState<string[]>(["All Categories"]);

  const handleCategoryChange = (category: string[]) => {
    setSelectedCategory(category);
  };

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

  useEffect(() => {
    if (selectedCategory) {
      onCategoryChange(selectedCategory);
    }
  }, [selectedCategory]);

  const { categories } = useCategoryContext();
  const worker = useMemo(() => new Worker(new URL("../../../helper/workers/workers", import.meta.url)), [expenses]);

  const filteredExpenses = useMemo(
    () => FilterAndGroupData(filterOption, expenses, categories, startDate || undefined, endDate || undefined, true),
    [filterOption, expenses, categories, startDate, endDate]
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
    GroupTransactionByDateAndCategoriesWorker(worker, filteredExpenses, categories, filterOption).then((data) => {
      if (isMounted) {
        setChartData(data as chartDataType[]);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [filteredExpenses, categories, filterOption]);

  const filteredChartData = useMemo(() => {
    if (chartData) {
      if (selectedCategory.includes("All Categories")) {
        return chartData;
      }
      return chartData
        .map((data) => ({
          ...data,
          categories: data.categories.filter((category) => selectedCategory.includes(category.category || "")),
        }))
        .filter((data) => data.categories.length > 0);
    }
  }, [chartData, selectedCategory]);

  const allCategories = Array.from(
    new Set(filteredChartData?.flatMap((data) => data.categories.map((category) => category.category)))
  );
  const formattedFilterOption = getFilterTitle(filterOption, startDate, endDate);

  const includeDateFilter = yearFilters.includes(filterOption);
  const totalAmount =
    filteredChartData
      ?.flatMap((item) => item.categories)
      .reduce((acc: number, curr: { total: number }) => acc + curr.total, 0) || 0;
  return (
    <>
      <FilterBudgetExpenseTrend
        title={title}
        timeframe={formattedFilterOption}
        onFilterChange={handleFilterOptionChange}
        onCategoryChange={handleCategoryChange}
        selectedCategory={selectedCategory}
        filterOption={filterOption}
        startDate={startDate}
        endDate={endDate}
        totalAmount={totalAmount}
        txnType={txn_types.Expenses}
      />

      <TrendByCategoryChart
        filteredChartData={filteredChartData || undefined}
        allCategories={allCategories}
        formattedFilterOption={formattedFilterOption}
        type={txn_types.Expenses}
        includeDateFilter={includeDateFilter}
      />
      <CustomMonthFilter isFormOpen={customMonthOpen} closeForm={handleCloseForm} onFormSubmit={handleMonthFilter} />
      <CustomYearFilter isFormOpen={customYearOpen} closeForm={handleCloseForm} onFormSubmit={handleYearFilter} />
    </>
  );
};
export default React.memo(ExpensebyCategoryTrend);
