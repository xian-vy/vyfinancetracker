import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import LocalMallIcon from "@mui/icons-material/LocalMall";
import PaidIcon from "@mui/icons-material/Paid";
import SavingsIcon from "@mui/icons-material/Savings";
import { Paper, Stack, Typography } from "@mui/material";
import React from "react";
import { formatNumberWithoutCurrency } from "../../helper/utils";
import { iconSizeXS } from "../../constants/size";
import { ReactComponent as Coin } from "../../media/coin.svg";
interface TrendTooltipProps {
  payload: any[];
  isExpenseChecked: boolean;
  isBudgetChecked: boolean;
  isIncomeChecked: boolean;
  isSavingsChecked: boolean;
  isBalanceChecked: boolean;
  label: string;
  formattedFilterOption: string;
  includeDateFilter: boolean;
}

const AllTransactionsTrendChartTooltip: React.FC<TrendTooltipProps> = ({
  payload,
  isExpenseChecked,
  isBudgetChecked,
  isIncomeChecked,
  isSavingsChecked,
  isBalanceChecked,
  label,
  formattedFilterOption,
  includeDateFilter,
}) => {
  if (payload && payload.length > 0) {
    let formattedDate = label;
    if (includeDateFilter) {
      formattedDate = label + " " + formattedFilterOption;
    }
    return (
      <>
        <Paper elevation={3} sx={{ padding: 2, minWidth: 200 }}>
          <Typography color="text.primary" variant="h6" textAlign="center" mb={2}>
            {formattedDate}
          </Typography>
          {payload
            .sort((a, b) => Number(b.value) - Number(a.value))
            .map((entry, index) => {
              let title: string;
              let isChecked: boolean;
              let icon: React.ReactElement;
              switch (entry.dataKey) {
                case "totalExpense":
                  title = "Expense";
                  isChecked = isExpenseChecked;
                  icon = <LocalMallIcon sx={{ color: entry.color, fontSize: iconSizeXS }} />;
                  break;
                case "totalBudget":
                  title = "Budget";
                  isChecked = isBudgetChecked;
                  icon = <AccountBalanceWalletIcon sx={{ color: entry.color, fontSize: iconSizeXS }} />;
                  break;
                case "totalIncome":
                  title = "Income";
                  isChecked = isIncomeChecked;
                  icon = <PaidIcon sx={{ color: entry.color, fontSize: iconSizeXS }} />;
                  break;
                case "totalContribution":
                  title = "Savings Contributions";
                  isChecked = isSavingsChecked;
                  icon = <SavingsIcon sx={{ color: entry.color, fontSize: iconSizeXS }} />;
                  break;
                case "balance":
                  title = "Net Worth";
                  isChecked = isBalanceChecked;
                  icon = <Coin fill={entry.color} style={{ width: "14px", height: "14px", marginLeft: "3px" }} />;
                  break;
                default:
                  return null;
              }
              return (
                isChecked && (
                  <Stack direction="row" key={index} alignItems="center" mb={1} width="100%">
                    {icon}
                    <Stack direction="row" justifyContent="space-between" width="100%" ml={0.5}>
                      <Typography>{title}</Typography>
                      <Typography>{formatNumberWithoutCurrency(Number(entry.value))}</Typography>
                    </Stack>
                  </Stack>
                )
              );
            })}
        </Paper>
      </>
    );
  }
  return null;
};

export default AllTransactionsTrendChartTooltip;
