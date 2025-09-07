import React, { useEffect, useMemo } from "react";
import { txn_types } from "../../../constants/collections";
import { FilterTimeframe, yearFilters } from "../../../constants/timeframes";
import { useIncomeSourcesContext } from "../../../contextAPI/IncomeSourcesContext";
import { useCategoryContext } from "../../../contextAPI/CategoryContext";
import { FilterAndGroupData } from "../../../helper/GenericTransactionHelper";
import { getFilterTitle } from "../../../helper/utils";
import { useFilterHandlers } from "../../../hooks/filterHook";
import useTrendByCategoryChart from "../../../hooks/trendByCategoryChartHook";
import CustomMonthFilter from "../../Filter/CustomMonthFilter";
import CustomYearFilter from "../../Filter/CustomYearFilter";
import FilterIncomeSavingsTrend from "../../Filter/FilterIncomeSavingsTrend";
import TrendByCategoryChart from "../TrendByCategoryChart";
import { COMPONENTS_WITH_TIMEFRAME } from "../../../constants/constants";
import { Timestamp } from "firebase/firestore";

type ExchangeItem = {
  id: string;
  amount: number;
  description: string;
  account_id: string;
  date: Timestamp;
  category_id: string;
  kind: "income" | "expense";
};

interface ExchangesTrendProps {
  exchanges: ExchangeItem[];
  onDateFilterChange: (filterOption: FilterTimeframe, startDate: Date | undefined, endDate: Date | undefined) => void;
}

const ExchangesByCategoryTrend: React.FC<ExchangesTrendProps> = ({ exchanges, onDateFilterChange }) => {
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
  } = useFilterHandlers(COMPONENTS_WITH_TIMEFRAME.INCOME);

  useEffect(() => {
    onDateFilterChange(filterOption, startDate || undefined, endDate || undefined);
  }, [handleFilterOptionChange]);

  const { incomeSource } = useIncomeSourcesContext();
  const { categories } = useCategoryContext();

  const combinedCategories = useMemo(() => {
    const seen = new Set<string>();
    const merged = [...incomeSource, ...categories].filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
    return merged;
  }, [incomeSource, categories]);

  const normalizedExchanges = useMemo(() => {
    return exchanges.map((e) => ({ ...e, amount: Math.abs(e.amount) }));
  }, [exchanges]);

  const filteredExchanges = useMemo(
    () =>
      FilterAndGroupData(
        filterOption,
        normalizedExchanges,
        combinedCategories,
        startDate || undefined,
        endDate || undefined,
        true
      ),
    [filterOption, normalizedExchanges, combinedCategories, startDate, endDate]
  );

  const formattedFilterOption = getFilterTitle(filterOption, startDate, endDate);
  const includeDateFilter = yearFilters.includes(filterOption);

  const { filteredChartData, allCategories, totalAmount } = useTrendByCategoryChart({
    transactionData: filteredExchanges,
    categories: combinedCategories,
    selectedTimeframe: filterOption,
    filterByCategory: false,
  });

  return (
    <>
      <FilterIncomeSavingsTrend
        title="Exchanges"
        timeframe={formattedFilterOption}
        onFilterChange={handleFilterOptionChange}
        filterOption={filterOption}
        startDate={startDate}
        endDate={endDate}
        totalAmount={totalAmount}
        txnType={"Exchanges"}
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

export default React.memo(ExchangesByCategoryTrend);


