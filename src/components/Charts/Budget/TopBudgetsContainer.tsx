import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { filterBudgetByDateRange } from "../../../helper/BudgetHelper";
import { groupDataByIdWithIcons } from "../../../helper/GenericTransactionHelper";
import { getCategoryDetails } from "../../../firebase/utils";
import { FilterTimeframe } from "../../../constants/timeframes";
import { useCategoryContext } from "../../../contextAPI/CategoryContext";
import { RootState } from "../../../redux/store";
import TransactionOverviewBreakdown from "../TransactionOverviewBreakdown";

interface Props {
  filterOption: FilterTimeframe;
  startDate: Date | null;
  endDate: Date | null;
  selectedCategories?: string[];
}
const TopBudgetsContainer = ({ filterOption, startDate, endDate, selectedCategories }: Props) => {
  const budgets = useSelector((state: RootState) => state.budget.budgets);

  const { categories } = useCategoryContext();

  const { budgetItems: budgetData } = useMemo(
    () => filterBudgetByDateRange(budgets, filterOption, startDate || undefined, endDate || undefined),
    [budgets, startDate, endDate, filterOption, categories]
  );

  const groupedData = useMemo(
    () => groupDataByIdWithIcons(getCategoryDetails, categories, budgetData, "category_id", selectedCategories),
    [budgetData, categories, selectedCategories]
  );

  return (
    <>
      <TransactionOverviewBreakdown groupedData={groupedData} />
    </>
  );
};

export default React.memo(TopBudgetsContainer);
