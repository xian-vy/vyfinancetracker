import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { txn_summary, txn_types } from "../../../constants/collections";
import { yearFilters } from "../../../constants/timeframes";
import { FilterAndGroupData } from "../../../helper/GenericTransactionHelper";
import { getFilterTitle } from "../../../helper/utils";
import { useFilterHandlers } from "../../../hooks/filterHook";
import useTrendByCategoryChart from "../../../hooks/trendByCategoryChartHook";
import { RootState } from "../../../redux/store";
import CustomMonthFilter from "../../Filter/CustomMonthFilter";
import CustomYearFilter from "../../Filter/CustomYearFilter";
import FilterIncomeSavingsTrend from "../../Filter/FilterIncomeSavingsTrend";
import TrendByCategoryChart from "../TrendByCategoryChart";

const SavingsTrend = () => {
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

  const savings = useSelector((state: RootState) => state.savings.savings);
  const savingsContributions = useSelector((state: RootState) => state.savingsContribution.contribution);

  const filteredContributions = useMemo(
    () =>
      FilterAndGroupData(
        filterOption,
        savingsContributions,
        savings,
        startDate || undefined,
        endDate || undefined,
        true
      ),
    [filterOption, savingsContributions, savings, startDate, endDate]
  );

  const formattedFilterOption = getFilterTitle(filterOption, startDate, endDate);
  const includeDateFilter = yearFilters.includes(filterOption);

  const { filteredChartData, allCategories, totalAmount } = useTrendByCategoryChart({
    transactionData: filteredContributions,
    categories: savings,
    selectedTimeframe: filterOption,
    filterByCategory: false,
  });

  return (
    <>
      <FilterIncomeSavingsTrend
        title="Savings"
        timeframe={formattedFilterOption}
        onFilterChange={handleFilterOptionChange}
        filterOption={filterOption}
        startDate={startDate}
        endDate={endDate}
        totalAmount={totalAmount}
        txnType={txn_summary.Savings}
      />

      <TrendByCategoryChart
        filteredChartData={filteredChartData || undefined}
        allCategories={allCategories}
        formattedFilterOption={formattedFilterOption}
        type={txn_types.Savings}
        includeDateFilter={includeDateFilter}
      />

      <CustomMonthFilter isFormOpen={customMonthOpen} closeForm={handleCloseForm} onFormSubmit={handleMonthFilter} />
      <CustomYearFilter isFormOpen={customYearOpen} closeForm={handleCloseForm} onFormSubmit={handleYearFilter} />
    </>
  );
};

export default SavingsTrend;
