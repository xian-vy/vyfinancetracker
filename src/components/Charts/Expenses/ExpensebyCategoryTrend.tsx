import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { txn_types } from "../../../constants/collections";
import { FilterTimeframe, yearFilters } from "../../../constants/timeframes";
import { useCategoryContext } from "../../../contextAPI/CategoryContext";
import { getFilterTitle } from "../../../helper/utils";
import { useFilterHandlers } from "../../../hooks/filterHook";
import useTrendByCategoryChart from "../../../hooks/trendByCategoryChartHook";
import { RootState } from "../../../redux/store";
import CustomMonthFilter from "../../Filter/CustomMonthFilter";
import CustomYearFilter from "../../Filter/CustomYearFilter";
import FilterBudgetExpenseTrend from "../../Filter/FilterBudgetExpenseTrend";
import TrendByCategoryChart from "../TrendByCategoryChart";
import { FilterAndGroupData } from "../../../helper/GenericTransactionHelper";
import { COMPONENTS_WITH_TIMEFRAME } from "../../../constants/constants";

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
  } = useFilterHandlers(COMPONENTS_WITH_TIMEFRAME.EXPENSES);

  useEffect(() => {
    onDateFilterChange(filterOption, startDate || undefined, endDate || undefined);
  }, [handleFilterOptionChange]);

  useEffect(() => {
    if (selectedCategory) {
      onCategoryChange(selectedCategory);
    }
  }, [selectedCategory]);

  const { categories } = useCategoryContext();
  const swapExpenseCategoryId = useMemo(() => categories.find((c) => c.description === "Swap Account")?.id || "", [categories]);
  const expensesExcludingSwap = useMemo(() => expenses.filter((e) => e.category_id !== swapExpenseCategoryId), [expenses, swapExpenseCategoryId]);

  const formattedFilterOption = getFilterTitle(filterOption, startDate, endDate);

  const includeDateFilter = yearFilters.includes(filterOption);

  const filteredExpenses = useMemo(
    () => FilterAndGroupData(filterOption, expensesExcludingSwap, categories, startDate || undefined, endDate || undefined, true),
    [filterOption, expensesExcludingSwap, categories, startDate, endDate]
  );

  const { filteredChartData, allCategories, totalAmount } = useTrendByCategoryChart({
    transactionData: filteredExpenses,
    categories: categories,
    selectedCategory: selectedCategory,
    selectedTimeframe: filterOption,
  });

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
