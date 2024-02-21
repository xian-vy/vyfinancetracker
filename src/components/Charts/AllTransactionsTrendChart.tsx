import { Box, Checkbox, CircularProgress, Typography, useMediaQuery, useTheme } from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { FilterAndGroupBudget } from "../../helper/BudgetHelper";
import { FilterAndGroupExpense } from "../../helper/ExpenseHelper";
import { FilterAndGroupIncome } from "../../helper/IncomeHelper";
import { FilterAndGroupSavingsContribution } from "../../helper/SavingsHelper";
import { formatShortAmountWithCurrency, hexToRGBA } from "../../helper/utils";
import { FilterAndGroupAllTransactionsWorker } from "../../helper/workers/workerHelper";
import { txn_types } from "../../constants/collections";
import {
  BALANCE_THEME,
  BUDGET_THEME,
  BUDGET_THEME_DARK,
  EXPENSES_THEME,
  EXPENSES_THEME_DARK,
  INCOME_THEME,
  INCOME_THEME_DARK,
  SAVINGS_THEME,
  SAVINGS_THEME_DARK,
} from "../../constants/componentTheme";
import { FilterTimeframe, yearFilters } from "../../constants/timeframes";
import { useCategoryContext } from "../../contextAPI/CategoryContext";
import { useIncomeSourcesContext } from "../../contextAPI/IncomeSourcesContext";
import { RootState } from "../../redux/store";
import AllTransactionsTrendChartTooltip from "./AllTransactionsTrendChartTooltip";

interface Props {
  filterOption: FilterTimeframe;
  startDate: Date | null;
  endDate: Date | null;
  formattedFilterOption: string;
}

type chartDataType = {
  date: string;
  totalExpense: number;
  totalBudget: number;
  totalIncome: number;
  totalContribution: number;
  balance: number;
};

const AllTransactionsTrendChart = (props: Props) => {
  const income = useSelector((state: RootState) => state.income.income);
  const expenses = useSelector((state: RootState) => state.expenses.expenses);
  const savingsContributions = useSelector((state: RootState) => state.savingsContribution.contribution);
  const budgets = useSelector((state: RootState) => state.budget.budgets);
  const [isExpenseChecked, setIsExpenseChecked] = useState(true);
  const [isBudgetChecked, setIsBudgetChecked] = useState(true);
  const [isIncomeChecked, setIsIncomeChecked] = useState(false);
  const [isSavingsChecked, setIsSavingsChecked] = useState(false);
  const [isBalanceChecked, setIsBalanceChecked] = useState(false);
  const [loading, setLoading] = useState(false);

  const powerSavingMode = useSelector((state: RootState) => state.powerSaving.enabled);
  const preferredFontSize = useSelector((state: RootState) => state.fontSize.size);

  const theme = useTheme();
  const smScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const isDarkMode = theme.palette.mode === "dark";

  const { categories } = useCategoryContext();
  const { incomeSource } = useIncomeSourcesContext();

  const handleExpenseChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsExpenseChecked(event.target.checked);
  };
  const handleBudgetChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsBudgetChecked(event.target.checked);
  };

  const handleIncomeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsIncomeChecked(event.target.checked);
  };

  const handleSavingsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsSavingsChecked(event.target.checked);
  };

  const handleBalanceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsBalanceChecked(event.target.checked);
  };

  const transactionTypes = [
    {
      id: "expense",
      title: txn_types.Expenses,
      theme: EXPENSES_THEME,
      themeDark: EXPENSES_THEME_DARK,
      isChecked: isExpenseChecked,
      handleCheckChange: handleExpenseChange,
      dataKey: "totalExpense",
    },
    {
      id: "budget",
      title: txn_types.Budget,
      theme: BUDGET_THEME,
      themeDark: BUDGET_THEME_DARK,
      isChecked: isBudgetChecked,
      handleCheckChange: handleBudgetChange,
      dataKey: "totalBudget",
    },
    {
      id: "income",
      title: txn_types.Income,
      theme: INCOME_THEME,
      themeDark: INCOME_THEME_DARK,
      isChecked: isIncomeChecked,
      handleCheckChange: handleIncomeChange,
      dataKey: "totalIncome",
    },
    {
      id: "savings",
      title: txn_types.SavingsContribution,
      theme: SAVINGS_THEME,
      themeDark: SAVINGS_THEME_DARK,
      isChecked: isSavingsChecked,
      handleCheckChange: handleSavingsChange,
      dataKey: "totalContribution",
    },
    {
      id: "balance",
      title: "Net Worth",
      theme: BALANCE_THEME,
      themeDark: BALANCE_THEME,
      isChecked: isBalanceChecked,
      handleCheckChange: handleBalanceChange,
      dataKey: "balance",
    },
  ];
  const filteredExpense = useMemo(
    () =>
      FilterAndGroupExpense(
        props.filterOption,
        expenses,
        categories,
        props.startDate || undefined,
        props.endDate || undefined,
        false //group by category?
      ),
    [props.filterOption, expenses, props.startDate, props.endDate]
  );

  const filteredIncome = useMemo(
    () =>
      FilterAndGroupIncome(
        props.filterOption,
        income,
        incomeSource,
        props.startDate || undefined,
        props.endDate || undefined,
        false //group by category?
      ),
    [props.filterOption, income, props.startDate, props.endDate]
  );

  const filteredSavingsContribution = useMemo(
    () =>
      FilterAndGroupSavingsContribution(
        props.filterOption,
        savingsContributions,
        props.startDate || undefined,
        props.endDate || undefined
      ),
    [props.filterOption, savingsContributions, props.startDate, props.endDate]
  );

  const filteredBudget = useMemo(
    () =>
      FilterAndGroupBudget(
        props.filterOption,
        budgets,
        categories,
        props.startDate || undefined,
        props.endDate || undefined,
        false //group by category?
      ),
    [props.filterOption, budgets, props.startDate, props.endDate]
  );

  const [chartData, setChartData] = useState<chartDataType[] | undefined>(undefined);

  const worker = useMemo(
    () => new Worker(new URL("../../helper/workers/allTrendChartWorker", import.meta.url)),
    [filteredExpense, filteredIncome, filteredBudget, filteredSavingsContribution, categories, incomeSource]
  );

  // necessary to populate/do worker function on first load
  useEffect(() => {
    return () => {
      worker.terminate();
    };
  }, [worker]);

  useEffect(() => {
    let isMounted = true;

    FilterAndGroupAllTransactionsWorker(
      worker,
      filteredExpense,
      filteredIncome,
      filteredBudget,
      filteredSavingsContribution,
      props.filterOption
    )
      .then((data) => {
        if (isMounted) {
          setChartData(data as chartDataType[]);
        }
      })
      .catch((error) => {
        console.error("An error occurred while filtering and grouping all transactions:", error);
      });

    return () => {
      isMounted = false;
    };
  }, [filteredExpense, filteredIncome, filteredBudget, filteredSavingsContribution, props.filterOption]);

  useEffect(() => {
    if (chartData) {
      setLoading(true);

      setTimeout(() => {
        setLoading(false);
      }, 500);
    }
  }, [props.filterOption]);

  //dont include the formattedFilterOption(ex: Jan 2024) if Week/Month Filters

  const includeDateFilter = yearFilters.includes(props.filterOption);

  return (
    <>
      <ResponsiveContainer width="100%" height={smScreen ? 300 : 400}>
        {!chartData || loading ? (
          <Box display="flex" justifyContent="center" alignItems="center">
            <CircularProgress size={20} />
          </Box>
        ) : (
          <ComposedChart data={chartData} margin={{ top: 0, right: smScreen ? 10 : 25, bottom: 0, left: 0 }}>
            <YAxis
              stroke={isDarkMode ? "#ccc" : "#666"}
              tickFormatter={(value) => formatShortAmountWithCurrency(value, false, true)}
              style={{
                fontSize: smScreen
                  ? preferredFontSize === "md"
                    ? "0.6rem"
                    : "0.5rem"
                  : preferredFontSize === "md"
                  ? "0.7rem"
                  : "0.6rem",
              }}
              axisLine={false}
              tickLine={false}
              width={smScreen ? 30 : undefined}
            />

            <XAxis
              dataKey="date"
              stroke={isDarkMode ? "#ccc" : "#666"}
              style={{
                fontSize: smScreen
                  ? preferredFontSize === "md"
                    ? "0.7rem"
                    : "0.6rem"
                  : preferredFontSize === "md"
                  ? "0.8rem"
                  : "0.7rem",
              }}
              axisLine={false}
              tickLine={false}
            />
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "#333" : "#e0e1e3"} />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <AllTransactionsTrendChartTooltip
                      payload={payload}
                      isBudgetChecked={isBudgetChecked}
                      isExpenseChecked={isExpenseChecked}
                      isIncomeChecked={isIncomeChecked}
                      isSavingsChecked={isSavingsChecked}
                      isBalanceChecked={isBalanceChecked}
                      label={label}
                      formattedFilterOption={props.formattedFilterOption}
                      includeDateFilter={includeDateFilter}
                    />
                  );
                }
                return null;
              }}
              cursor={{ fill: isDarkMode ? "#333" : "#ccc" }}
              isAnimationActive={powerSavingMode ? false : true}
            />

            {transactionTypes.map((type, index) =>
              type.isChecked ? (
                type.id === "expense" || type.id === "budget" ? (
                  <Bar
                    isAnimationActive={powerSavingMode ? false : true}
                    key={index}
                    dataKey={type.dataKey}
                    name={type.title}
                    fill={isDarkMode ? hexToRGBA(type.themeDark) : hexToRGBA(type.theme)}
                    barSize={15}
                    maxBarSize={20}
                    radius={[4, 4, 0, 0]}
                    strokeWidth={1}
                    stroke={isDarkMode ? "#1e1e1e" : type.theme}
                  />
                ) : (
                  <Line
                    isAnimationActive={powerSavingMode ? false : true}
                    key={index}
                    type="linear"
                    dataKey={type.dataKey}
                    name={type.title}
                    stroke={isDarkMode ? type.themeDark : type.theme}
                    dot={{ fill: isDarkMode ? type.themeDark : type.theme, r: 1 }}
                    activeDot={false}
                    strokeWidth={2}
                  />
                )
              ) : null
            )}
          </ComposedChart>
        )}
      </ResponsiveContainer>
      <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap" }}>
        {transactionTypes.map((type, index) => (
          <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }} key={index}>
            <Checkbox
              onChange={type.handleCheckChange}
              checked={type.isChecked}
              sx={{
                "&.MuiSvgIcon-root": {
                  fill: type.theme,
                },
                "&.Mui-checked .MuiSvgIcon-root": {
                  fill: type.theme,
                },
                px: 0,
              }}
            />
            <Typography variant="caption" color="inherit" sx={{ mr: 1 }}>
              {type.title}
            </Typography>
          </div>
        ))}
      </div>
    </>
  );
};

export default React.memo(AllTransactionsTrendChart);
