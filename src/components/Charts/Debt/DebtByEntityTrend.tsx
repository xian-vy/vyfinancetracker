import React, { useEffect, useMemo } from "react";
import { Timestamp } from "firebase/firestore";
import { COMPONENTS_WITH_TIMEFRAME } from "../../../constants/constants";
import { FilterTimeframe, yearFilters } from "../../../constants/timeframes";
import { useFilterHandlers } from "../../../hooks/filterHook";
import { FilterAndGroupData } from "../../../helper/GenericTransactionHelper";
import useTrendByCategoryChart from "../../../hooks/trendByCategoryChartHook";
import { getFilterTitle } from "../../../helper/utils";
import TrendByCategoryChart from "../TrendByCategoryChart";
import FilterIncomeSavingsTrend from "../../Filter/FilterIncomeSavingsTrend";
import { txn_types } from "../../../constants/collections";

type DebtItem = {
  id: string;
  amount: number;
  description: string; 
  account_id: string;
  date: Timestamp;
  category_id: string; // virtual category id derived from creditor/debtor side
};

interface Props {
  debts: DebtItem[];
  categories: { id: string; description: string; color: string; icon: string }[];
  onDateFilterChange: (
    filterOption: FilterTimeframe,
    startDate: Date | undefined,
    endDate: Date | undefined
  ) => void;
}

const DebtByEntityTrend: React.FC<Props> = ({ debts, categories, onDateFilterChange }) => {
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
  }, [filterOption, startDate, endDate]);

  const normalizedDebts = useMemo(() => debts.map((d) => ({ ...d, amount: Math.abs(d.amount) })), [debts]);

  const filteredDebts = useMemo(
    () =>
      FilterAndGroupData(
        filterOption,
        normalizedDebts,
        categories,
        startDate || undefined,
        endDate || undefined,
        true
      ),
    [filterOption, normalizedDebts, categories, startDate, endDate]
  );

  const formattedFilterOption = getFilterTitle(filterOption, startDate, endDate);
  const includeDateFilter = yearFilters.includes(filterOption);

  const { filteredChartData, allCategories, totalAmount } = useTrendByCategoryChart({
    transactionData: filteredDebts,
    categories,
    selectedTimeframe: filterOption,
    filterByCategory: false,
  });

  return (
    <>
      <FilterIncomeSavingsTrend
        title="Debt"
        timeframe={formattedFilterOption}
        onFilterChange={handleFilterOptionChange}
        filterOption={filterOption}
        startDate={startDate}
        endDate={endDate}
        totalAmount={totalAmount}
        txnType={"Debt"}
      />

      <TrendByCategoryChart
        filteredChartData={filteredChartData || undefined}
        allCategories={allCategories}
        formattedFilterOption={formattedFilterOption}
        type={txn_types.Expenses}
        includeDateFilter={includeDateFilter}
      />
    </>
  );
};

export default React.memo(DebtByEntityTrend);


