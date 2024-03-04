import React from "react";
import { useSelector } from "react-redux";
import { calculateTotalSum } from "../../helper/GenericTransactionHelper";
import { RootState } from "../../redux/store";
import { Stack, Typography, Divider, useTheme, Tooltip } from "@mui/material";
import { formatShortAmountWithCurrency } from "../../helper/utils";
import { ReactComponent as Coin } from "../../media/coin.svg";

const TotalNetWorth = ({ collapsedDrawer }: { collapsedDrawer: boolean }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const isMasked = useSelector((state: RootState) => state.userAccount.hideBalances);

  const savingsContribution = useSelector((state: RootState) => state.savingsContribution.contribution);
  const expenses = useSelector((state: RootState) => state.expenses.expenses);
  const income = useSelector((state: RootState) => state.income.income);

  const totalSavingsContribution = calculateTotalSum(savingsContribution, "amount");
  const totalExpenses = calculateTotalSum(expenses, "amount");
  const totalIncome = calculateTotalSum(income, "amount");

  const totalBalance = totalIncome - totalExpenses - totalSavingsContribution;
  return (
    <div>
      {!collapsedDrawer && (
        <Tooltip title="Total NetWorth">
          <Stack direction="row" my={0.5} justifyContent="center" alignItems="center" sx={{ cursor: "pointer" }}>
            <Coin fill={isDarkMode ? "#ccc" : "#666"} style={{ width: "14px", height: "14px", marginRight: "5px" }} />
            <Typography textAlign="center" variant="h4" sx={{ color: totalBalance < 0 ? "salmon" : "inherit" }}>
              {isMasked
                ? "****"
                : totalBalance === 0
                ? "0.00"
                : formatShortAmountWithCurrency(totalBalance, false, true)}
            </Typography>
            <Divider
              orientation="vertical"
              sx={{ height: 12, mx: 1, my: "auto", borderColor: theme.palette.divider }}
            />
            <Typography textAlign="center" variant="caption">
              {new Date().toLocaleString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </Typography>
          </Stack>
        </Tooltip>
      )}
    </div>
  );
};

export default React.memo(TotalNetWorth);
