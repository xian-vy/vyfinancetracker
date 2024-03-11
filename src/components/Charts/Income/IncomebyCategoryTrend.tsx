import React, { useEffect, useMemo } from "react";
import { txn_types } from "../../../constants/collections";
import { FilterTimeframe, yearFilters } from "../../../constants/timeframes";
import { useIncomeSourcesContext } from "../../../contextAPI/IncomeSourcesContext";
import { FilterAndGroupData } from "../../../helper/GenericTransactionHelper";
import { getFilterTitle } from "../../../helper/utils";
import { useFilterHandlers } from "../../../hooks/filterHook";
import useTrendByCategoryChart from "../../../hooks/trendByCategoryChartHook";
import IncomeModel from "../../../models/IncomeModel";
import CustomMonthFilter from "../../Filter/CustomMonthFilter";
import CustomYearFilter from "../../Filter/CustomYearFilter";
import FilterIncomeSavingsTrend from "../../Filter/FilterIncomeSavingsTrend";
import TrendByCategoryChart from "../TrendByCategoryChart";

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

  const filteredIncome = useMemo(
    () => FilterAndGroupData(filterOption, incomes, incomeSource, startDate || undefined, endDate || undefined, true),
    [filterOption, incomes, incomeSource, startDate, endDate]
  );

  const formattedFilterOption = getFilterTitle(filterOption, startDate, endDate);
  const includeDateFilter = yearFilters.includes(filterOption);

  const { filteredChartData, allCategories, totalAmount } = useTrendByCategoryChart({
    transactionData: filteredIncome,
    categories: incomeSource,
    selectedTimeframe: filterOption,
    filterByCategory: false,
  });

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
        filteredChartData={filteredChartData || undefined}
        allCategories={allCategories}
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
