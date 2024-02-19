import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { filterBudgetByDateRange } from "../../../Helper/BudgetHelper";
import { groupDataByIdWithIcons } from "../../../Helper/GenericTransactionHelper";
import { getCategoryDetails } from "../../../firebase/utils";
import { FilterTimeframe } from "../../../constants/timeframes";
import { useCategoryContext } from "../../../contextAPI/CategoryContext";
import { RootState } from "../../../redux/store";
import GenericHorizontalBarChart from "../GenericHorizontalBarChart";

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

  const groupedData = groupDataByIdWithIcons(
    getCategoryDetails,
    categories,
    budgetData,
    "category_id",
    selectedCategories
  );

  return (
    <>
      <GenericHorizontalBarChart groupedData={groupedData} />
    </>
  );
};

export default React.memo(TopBudgetsContainer);
