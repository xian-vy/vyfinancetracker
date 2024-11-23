import { Divider, Stack, Tooltip, Typography, useTheme } from "@mui/material";
import React from "react";
import { useSelector } from "react-redux";
import { generateDebtAmounts } from "../../helper/DebtHelper";
import { calculateTotalSum } from "../../helper/GenericTransactionHelper";
import { formatShortAmountWithCurrency } from "../../helper/utils";
import { ReactComponent as Coin } from "../../media/coin.svg";
import DebtModel from "../../models/DebtModel";
import ExpenseModel from "../../models/ExpenseModel";
import IncomeModel from "../../models/IncomeModel";
import SavingGoalsContributionModel from "../../models/SavingGoalsContribution";
import { RootState } from "../../redux/store";

const TotalNetWorth = ({ collapsedDrawer }: { collapsedDrawer: boolean }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const isMasked = useSelector((state: RootState) => state.userAccount.hideBalances);

  const savingsContribution : SavingGoalsContributionModel[] = useSelector((state: RootState) => state.savingsContribution.contribution);
  const expenses : ExpenseModel[] = useSelector((state: RootState) => state.expenses.expenses);
  const income : IncomeModel[]= useSelector((state: RootState) => state.income.income);
  const debt : DebtModel[]= useSelector((state: RootState) => state.debt.debt);
  const debtItems = generateDebtAmounts(debt);

  const totalSavingsContribution = calculateTotalSum(savingsContribution, "amount");
  const totalExpenses = calculateTotalSum(expenses, "amount");
  const totalIncome = calculateTotalSum(income, "amount");
  const totalDebt = calculateTotalSum(debtItems, "amount");

  const totalBalance = totalIncome - totalExpenses - totalSavingsContribution + totalDebt;
  return (
    <Stack my={1}>
      {!collapsedDrawer && (
        <Tooltip title="Total NetWorth">
          <Stack direction="row" my={0.5} justifyContent="center" alignItems="center" sx={{ cursor: "pointer" }}>
            <Coin fill={isDarkMode ? "#ccc" : "#666"} style={{ width: "14px", height: "14px", marginRight: "5px",marginBottom : "3px" }} />
            <Typography textAlign="center" component={"div"} variant="h4" sx={{ color: totalBalance < 0 ? "salmon" : "inherit" }}>
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
    </Stack>
  );
};

export default React.memo(TotalNetWorth);
