import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import LocalMallIcon from "@mui/icons-material/LocalMall";
import NorthIcon from "@mui/icons-material/North";
import PaidIcon from "@mui/icons-material/Paid";
import SavingsIcon from "@mui/icons-material/Savings";
import SouthIcon from "@mui/icons-material/South";
import { Theme } from "@mui/material";
import React from "react";
import "swiper/css";
import { ReactComponent as Coin } from "../../media/coin.svg";
import { txn_summary } from "../../constants/collections";
import {
  PERCENTAGE_INCREASE,
  PERCENTAGE_DECREASE,
  EXPENSES_THEME_DARK,
  EXPENSES_THEME,
  INCOME_THEME_DARK,
  INCOME_THEME,
  BUDGET_THEME_DARK,
  BUDGET_THEME,
  SAVINGS_THEME_DARK,
  SAVINGS_THEME,
  BALANCE_THEME_DARK,
  BALANCE_THEME,
  DEBT_THEME,
  DEBT_THEME_DARK,
} from "../../constants/componentTheme";
import { iconSizeXS } from "../../constants/size";
import { hoverBgColor } from "../../helper/utils";
import PriceChangeIcon from '@mui/icons-material/PriceChange';

export const calculateCurrentSum = (
  type: string,
  incomeSum: number,
  expenseSum: number,
  contributionSum: number,
  budgetSum: number,
  debtSum: number
) => {
  switch (type) {
    case txn_summary.Balance:
      return incomeSum - expenseSum - contributionSum;
    case txn_summary.Expenses:
      return expenseSum;
    case txn_summary.Budget:
      return budgetSum;
    case txn_summary.Income:
      return incomeSum;
    case txn_summary.Savings:
      return contributionSum;
    case txn_summary.Debt:
      return debtSum;
    default:
      return 0;
  }
};

export const calculatePrevSum = (
  type: string,
  incomePrevSum: number,
  expensePrevSum: number,
  contributionPrevSum: number,
  budgetPrevSum: number,
  debtPrevSum : number
) => {
  switch (type) {
    case txn_summary.Balance:
      return incomePrevSum - expensePrevSum - contributionPrevSum;
    case txn_summary.Expenses:
      return expensePrevSum;
    case txn_summary.Budget:
      return budgetPrevSum;
    case txn_summary.Income:
      return incomePrevSum;
    case txn_summary.Savings:
      return contributionPrevSum;
    case txn_summary.Debt:
      return debtPrevSum
    default:
      return 0;
  }
};

export const calculatePercentageIncrease = (currentSUM: number, prevSUM: number) => {
  return prevSUM !== 0 ? ((currentSUM - prevSUM) / Math.abs(prevSUM)) * 100 : NaN;
};

export const determinePercentageColor = (percentageIncrease: number) => {
  return percentageIncrease === 0 || isNaN(percentageIncrease)
    ? "inherit"
    : percentageIncrease > 0
    ? PERCENTAGE_INCREASE
    : PERCENTAGE_DECREASE;
};

export const determinePercentageStr = (percentageIncrease: number, currentSUM: number, prevSUM: number) => {
  return isNaN(percentageIncrease) || percentageIncrease === 0
    ? "0%"
    : (currentSUM > prevSUM ? "+" : "") + percentageIncrease.toFixed(1) + "%";
};

export const determinePercentageIcon = (percentageIncrease: number, currentSUM: number, prevSUM: number) => {
  return isNaN(percentageIncrease) || percentageIncrease === 0 ? (
    <></>
  ) : currentSUM > prevSUM ? (
    <NorthIcon sx={{ color: determinePercentageColor(percentageIncrease), fontSize: "14px " }} />
  ) : (
    <SouthIcon sx={{ color: determinePercentageColor(percentageIncrease), fontSize: "14px " }} />
  );
};

export const swiperBreakpointsConfig = {
  300: {
    slidesPerView: 1.3,
  },
  640: {
    slidesPerView: 2.2,
  },
  768: {
    slidesPerView: 2.3,
  },
  1100: {
    spaceBetween: 15,
    slidesPerView: 2.6,
  },
  1350: {
    slidesPerView: 3.2,
  },
  1450: {
    slidesPerView: 4.2,
  },
  1600: {
    slidesPerView: 5,
  },
};

export function typeIconColor(type: string, theme: Theme, isDarkMode: boolean) {
  switch (type) {
    case txn_summary.Expenses:
      return {
        icon: <LocalMallIcon sx={{ color: hoverBgColor(theme), fontSize: iconSizeXS }} />,
        color: isDarkMode ? EXPENSES_THEME_DARK : EXPENSES_THEME,
      };
    case txn_summary.Income:
      return {
        icon: <PaidIcon sx={{ color: hoverBgColor(theme), fontSize: iconSizeXS }} />,
        color: isDarkMode ? INCOME_THEME_DARK : INCOME_THEME,
      };
    case txn_summary.Budget:
      return {
        icon: <AccountBalanceWalletIcon sx={{ color: hoverBgColor(theme), fontSize: iconSizeXS }} />,
        color: isDarkMode ? BUDGET_THEME_DARK : BUDGET_THEME,
      };
    case txn_summary.Savings:
      return {
        icon: <SavingsIcon sx={{ color: hoverBgColor(theme), fontSize: iconSizeXS }} />,
        color: isDarkMode ? SAVINGS_THEME_DARK : SAVINGS_THEME,
      };
    case txn_summary.Balance:
      return {
        icon: <Coin fill={hoverBgColor(theme)} style={{ width: "14px", height: "14px" }} />,
        color: isDarkMode ? BALANCE_THEME_DARK : BALANCE_THEME,
      };
     case txn_summary.Debt:
      return {
        icon: <PriceChangeIcon style={{ color: hoverBgColor(theme), width: "14px", height: "14px" }} />,
        color: isDarkMode ? DEBT_THEME_DARK : DEBT_THEME,
      };
    default:
      throw new Error(`Unsupported type: ${type}`);
  }
}
