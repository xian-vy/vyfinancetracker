import { Box, Breadcrumbs, Link } from "@mui/material";
import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { filterDataByDateRange, groupDataByIdWithIcons } from "../../../Helper/GenericTransactionHelper";
import { getAccountsDetails, getIncomeSourceDetails } from "../../../firebase/utils";
import { FilterTimeframe } from "../../../constants/timeframes";
import { useAccountTypeContext } from "../../../contextAPI/AccountTypeContext";
import { useIncomeSourcesContext } from "../../../contextAPI/IncomeSourcesContext";
import { RootState } from "../../../redux/store";
import GenericHorizontalBarChart from "../GenericHorizontalBarChart";
interface Props {
  filterOption: FilterTimeframe;
  startDate: Date | null;
  endDate: Date | null;
}
type groupedData = {
  category: string;
  amount: number;
  color: string;
  icon: React.ReactElement;
};
const TopIncomeContainer = ({ filterOption, startDate, endDate }: Props) => {
  const [filter, setFilter] = React.useState("Source");

  const income = useSelector((state: RootState) => state.income.income);

  const { incomeSource } = useIncomeSourcesContext();
  const { accountType } = useAccountTypeContext();

  const incomeData = useMemo(
    () => filterDataByDateRange(income, "date", filterOption, startDate || undefined, endDate || undefined),
    [income, startDate, endDate, filterOption, incomeSource, accountType]
  );

  let groupedData: groupedData[] = [];

  switch (filter) {
    case "Source":
      groupedData = groupDataByIdWithIcons(getIncomeSourceDetails, incomeSource, incomeData, "category_id");
      break;
    case "Account":
      groupedData = groupDataByIdWithIcons(getAccountsDetails, accountType, incomeData, "account_id");
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
            underline={filter === "Source" ? "always" : "hover"}
            onClick={() => setFilter("Source")}
            sx={{ cursor: "pointer", WebkitTapHighlightColor: "transparent" }}
          >
            Income Source
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

export default React.memo(TopIncomeContainer);
