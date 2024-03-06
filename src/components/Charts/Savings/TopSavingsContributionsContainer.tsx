import { Box, Breadcrumbs, Link } from "@mui/material";
import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { filterDataByDateRange } from "../../../helper/GenericTransactionHelper";
import {
  GroupSavingsWithContributions,
  GroupSavingsWithContributionsByAccountType,
} from "../../../helper/SavingsHelper";
import { FilterTimeframe } from "../../../constants/timeframes";
import { useAccountTypeContext } from "../../../contextAPI/AccountTypeContext";
import { RootState } from "../../../redux/store";
import TransactionOverviewBreakdown from "../TransactionOverviewBreakdown";

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
const TopSavingsContributionsContainer = ({ filterOption, startDate, endDate }: Props) => {
  const savingsContributions = useSelector((state: RootState) => state.savingsContribution.contribution);
  const savings = useSelector((state: RootState) => state.savings.savings);
  const { accountType } = useAccountTypeContext();
  const [filter, setFilter] = React.useState("Contribution");

  const savingsContributionsData = useMemo(
    () =>
      filterDataByDateRange(savingsContributions, "date", filterOption, startDate || undefined, endDate || undefined),
    [savingsContributions, startDate, endDate, filterOption]
  );

  let groupedData: groupedData[] = [];

  switch (filter) {
    case "Contribution":
      groupedData = Object.values(GroupSavingsWithContributions(savings, savingsContributionsData));
      break;
    case "Account":
      groupedData = Object.values(
        GroupSavingsWithContributionsByAccountType(savings, savingsContributionsData, accountType)
      );
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
            underline={filter === "Contribution" ? "always" : "hover"}
            onClick={() => setFilter("Contribution")}
            sx={{ cursor: "pointer", WebkitTapHighlightColor: "transparent" }}
          >
            Contributions
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
      <TransactionOverviewBreakdown groupedData={groupedData} />
    </>
  );
};

export default React.memo(TopSavingsContributionsContainer);
