import { Box, Breadcrumbs, Link } from "@mui/material";
import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { filterDataByDateRange, groupDataByIdWithIcons } from "../../../helper/GenericTransactionHelper";
import { getCategoryDetails, getAccountsDetails } from "../../../firebase/utils";
import { useCategoryContext } from "../../../contextAPI/CategoryContext";
import { useAccountTypeContext } from "../../../contextAPI/AccountTypeContext";
import { RootState } from "../../../redux/store";
import GenericHorizontalBarChart from "../GenericHorizontalBarChart";
type groupedData = {
  category: string;
  amount: number;
  color: string;
  icon: React.ReactElement;
};
interface Props {
  filterOption: string;
  startDate: Date | null;
  endDate: Date | null;
  selectedCategories?: string[];
}
const TopExpensesContainer = ({ filterOption, startDate, endDate, selectedCategories }: Props) => {
  const expenses = useSelector((state: RootState) => state.expenses.expenses);

  const [filter, setFilter] = React.useState("Category");

  const { categories } = useCategoryContext();
  const { accountType } = useAccountTypeContext();

  const expenseData = useMemo(
    () => filterDataByDateRange(expenses, "date", filterOption, startDate || undefined, endDate || undefined),
    [expenses, startDate, endDate, filterOption, categories, accountType]
  );

  let groupedData: groupedData[] = [];

  switch (filter) {
    case "Category":
      groupedData = groupDataByIdWithIcons(
        getCategoryDetails,
        categories,
        expenseData,
        "category_id",
        selectedCategories
      );
      break;
    case "Account":
      groupedData = groupDataByIdWithIcons(getAccountsDetails, accountType, expenseData, "account_id");
      break;
    default:
      break;
  }

  return (
    <>
      <Box display="flex" justifyContent="center" sx={{ p: 0, mb: 2 }}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link
            color="inherit"
            variant="body1"
            underline={filter === "Category" ? "always" : "hover"}
            onClick={() => setFilter("Category")}
            sx={{ cursor: "pointer", WebkitTapHighlightColor: "transparent" }}
          >
            Category
          </Link>
          <Link
            color="inherit"
            variant="body1"
            underline={filter === "Account" ? "always" : "hover"}
            onClick={() => setFilter("Account")}
            sx={{ cursor: "pointer", WebkitTapHighlightColor: "transparent" }}
          >
            Accounts
          </Link>
        </Breadcrumbs>
      </Box>
      <GenericHorizontalBarChart groupedData={groupedData} />
    </>
  );
};

export default TopExpensesContainer;
