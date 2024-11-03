import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { txn_types } from "../../../constants/collections";
import { FilterTimeframe, yearFilters } from "../../../constants/timeframes";
import { useCategoryContext } from "../../../contextAPI/CategoryContext";
import { FilterAndGroupBudget } from "../../../helper/BudgetHelper";
import { getFilterTitle } from "../../../helper/utils";
import { useFilterHandlers } from "../../../hooks/filterHook";
import useTrendByCategoryChart from "../../../hooks/trendByCategoryChartHook";
import { RootState } from "../../../redux/store";
import CustomMonthFilter from "../../Filter/CustomMonthFilter";
import CustomYearFilter from "../../Filter/CustomYearFilter";
import FilterBudgetExpenseTrend from "../../Filter/FilterBudgetExpenseTrend";
import TrendByCategoryChart from "../TrendByCategoryChart";
import { COMPONENTS_WITH_TIMEFRAME } from "../../../constants/constants";

interface Props {
  title: string;
  onDateFilterChange: (filterOption: FilterTimeframe, startDate: Date | undefined, endDate: Date | undefined) => void;
}

const BudgetByCategoryTrend: React.FC<Props> = ({ title, onDateFilterChange }) => {
  const budgets = useSelector((state: RootState) => state.budget.budgets);

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
  } = useFilterHandlers(COMPONENTS_WITH_TIMEFRAME.BUDGETS);

  useEffect(() => {
    onDateFilterChange(filterOption, startDate || undefined, endDate || undefined);
  }, [handleFilterOptionChange]);

  const { categories, loading } = useCategoryContext();

  const filteredBudget = useMemo(
    () => FilterAndGroupBudget(filterOption, budgets, categories, startDate || undefined, endDate || undefined, true),
    [filterOption, budgets, categories, startDate, endDate]
  );

  const formattedFilterOption = getFilterTitle(filterOption, startDate, endDate);

  //dont include the formattedFilterOption(ex: Jan 2024) if Week/Month Filters

  const includeDateFilter = yearFilters.includes(filterOption);

  const { filteredChartData, allCategories, totalAmount } = useTrendByCategoryChart({
    transactionData: filteredBudget,
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
        txnType={txn_types.Budget}
      />

      <TrendByCategoryChart
        filteredChartData={filteredChartData || undefined}
        allCategories={allCategories}
        formattedFilterOption={formattedFilterOption}
        type={txn_types.Budget}
        includeDateFilter={includeDateFilter}
      />

      <CustomMonthFilter isFormOpen={customMonthOpen} closeForm={handleCloseForm} onFormSubmit={handleMonthFilter} />
      <CustomYearFilter isFormOpen={customYearOpen} closeForm={handleCloseForm} onFormSubmit={handleYearFilter} />
    </>
  );
};
export default React.memo(BudgetByCategoryTrend);
