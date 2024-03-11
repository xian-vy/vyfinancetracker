import React from "react";
import { useSelector } from "react-redux";
import { txn_summary, txn_types } from "../../../constants/collections";
import { yearFilters } from "../../../constants/timeframes";
import { FilterAndGroupData, GroupTransactionByDateAndCategories } from "../../../helper/GenericTransactionHelper";
import { getFilterTitle } from "../../../helper/utils";
import { useFilterHandlers } from "../../../hooks/filterHook";
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

  const filteredContributions = FilterAndGroupData(
    filterOption,
    savingsContributions,
    savings,
    startDate || undefined,
    endDate || undefined,
    true
  );

  const chartData = GroupTransactionByDateAndCategories(filteredContributions, savings, filterOption);

  const formattedFilterOption = getFilterTitle(filterOption, startDate, endDate);
  const includeDateFilter = yearFilters.includes(filterOption);

  const allSavingsCategories = Array.from(
    new Set(chartData?.flatMap((item) => item.categories.map((source) => source.category)))
  );

  const totalAmount =
    chartData
      ?.flatMap((item) => item.categories)
      .reduce((acc: number, curr: { total: number }) => acc + curr.total, 0) || 0;

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
        filteredChartData={chartData || undefined}
        allCategories={allSavingsCategories}
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
