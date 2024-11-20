import React from "react";
import { useSelector } from "react-redux";
import { calculateTotalSum } from "../../helper/GenericTransactionHelper";
import { RootState } from "../../redux/store";
import { Stack, Typography, Divider, useTheme, Tooltip } from "@mui/material";
import { formatShortAmountWithCurrency } from "../../helper/utils";
import { ReactComponent as Coin } from "../../media/coin.svg";
import SavingGoalsContributionModel from "../../models/SavingGoalsContribution";
import ExpenseModel from "../../models/ExpenseModel";
import IncomeModel from "../../models/IncomeModel";
import DebtModel from "../../models/DebtModel";
import { generateDebtAmounts } from "../../helper/DebtHelper";

const TotalNetWorth = ({ collapsedDrawer }: { collapsedDrawer: boolean }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const isMasked = useSelector((state: RootState) => state.userAccount.hideBalances);

  const savingsContribution : SavingGoalsContributionModel[] = useSelector((state: RootState) => state.savingsContribution.contribution);
  const expenses : ExpenseModel[] = useSelector((state: RootState) => state.expenses.expenses);
  const income : IncomeModel[]= useSelector((state: RootState) => state.income.income);
  const debt : DebtModel[]= useSelector((state: RootState) => state.debt.debt);
  const debtItems = generateDebtAmounts(debt);
  const netDebt =   debtItems.reduce((sum, item) => {
    if (item.amount < 0) {
      return sum - item.amount; // Debt Owed (Borrowed Paid, Lended UnPaid)
    } else {
      return sum + item.amount; // Debt Owned (Borrowed UnPaid, Lended Paid)
    }
  }, 0) || 0;

  const totalSavingsContribution = calculateTotalSum(savingsContribution, "amount");
  const totalExpenses = calculateTotalSum(expenses, "amount");
  const totalIncome = calculateTotalSum(income, "amount");
  const totalBalance = totalIncome - totalExpenses - totalSavingsContribution - netDebt;
  return (
    <div>
      {!collapsedDrawer && (
        <Tooltip title="Total NetWorth">
          <Stack direction="row" my={0.5} justifyContent="center" alignItems="center" sx={{ cursor: "pointer" }}>
            <Coin fill={isDarkMode ? "#ccc" : "#666"} style={{ width: "14px", height: "14px", marginRight: "5px" }} />
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
    </div>
  );
};

export default React.memo(TotalNetWorth);
