import { Box, Container, Paper, useTheme } from "@mui/material";
import Typography from "@mui/material/Typography";
import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";
import { distributeBudgetAmounts } from "../../helper/BudgetHelper";
import {
  calculateCurrentSum,
  calculatePercentageIncrease,
  calculatePrevSum,
  determinePercentageColor,
  determinePercentageIcon,
  determinePercentageStr,
  swiperBreakpointsConfig,
  typeIconColor,
} from "./TransactionOverviewHelper";
import { getFilterTitle } from "../../helper/utils";
import { txn_summary } from "../../constants/collections";
import { useFilterHandlers } from "../../hooks/filterHook";
import { useSumDataByTimeframe } from "../../hooks/sumDataByTimeframeHook";
import { RootState } from "../../redux/store";
import GenericDialog from "../Dialog/GenericDialog";
import FilterActionsComponent from "../Filter/FilterActionsComponent";
import FilterTitleAndIcon from "../Filter/FilterTitleAndIcon";
import TransactionOverviewItems from "./TransactionOverviewItems";

type sumByTransaction = {
  sum: number;
  prevSum: number;
  prevDate: string;
};
const paperStyle = {
  px: { xs: 1.5, md: 2 },
  py: { xs: 1.5, md: 2 },
  borderRadius: 3,
  mb: 1,
};

const TransactionOverview = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  const {
    filterOption,
    customMonthOpen,
    customYearOpen,
    startDate,
    anchorEl,
    filterOpen,
    handleFilterClick,
    handleFilterClose,
    endDate,
    handleFilterOptionChange,
    handleCloseForm,
    handleYearFilter,
    handleMonthFilter,
  } = useFilterHandlers();

  const budgetStore = useSelector((state: RootState) => state.budget.budgets);
  const incomeStore = useSelector((state: RootState) => state.income.income);
  const expenseStore = useSelector((state: RootState) => state.expenses.expenses);
  const savingsContributionStore = useSelector((state: RootState) => state.savingsContribution.contribution);

  const [budget, setBudget] = useState<sumByTransaction | null>(null);
  const [income, setIncome] = useState<sumByTransaction | null>(null);
  const [savings, setSavings] = useState<sumByTransaction | null>(null);
  const [expenses, setExpenses] = useState<sumByTransaction | null>(null);
  const [loading, setLoading] = useState(false);
  const [openInfoDialog, setOpenInfoDialog] = React.useState(false);

  const { budgetItems } = distributeBudgetAmounts(
    budgetStore,
    filterOption,
    startDate || undefined,
    endDate || undefined
  );

  const workerIncome = useMemo(() => new Worker(new URL("../../helper/workers/workers", import.meta.url)), []);
  const workerSavings = useMemo(() => new Worker(new URL("../../helper/workers/workers", import.meta.url)), []);

  const workerExpense = useMemo(() => new Worker(new URL("../../helper/workers/workers", import.meta.url)), []);

  const workerBudget = useMemo(() => new Worker(new URL("../../helper/workers/workers", import.meta.url)), []);

  // necessary to populate/do worker function on first load
  useEffect(() => {
    return () => {
      workerBudget.terminate();
      workerIncome.terminate();
      workerSavings.terminate();
      workerExpense.terminate();
    };
  }, [workerBudget, workerIncome, workerSavings, workerExpense]);

  useSumDataByTimeframe(
    workerBudget,
    budgetItems,
    setBudget,
    filterOption,
    startDate || undefined,
    endDate || undefined,
    [budgetStore, filterOption, startDate, endDate]
  );
  useSumDataByTimeframe(
    workerIncome,
    incomeStore,
    setIncome,
    filterOption,
    startDate || undefined,
    endDate || undefined,
    [incomeStore, filterOption, startDate, endDate]
  );
  useSumDataByTimeframe(
    workerSavings,
    savingsContributionStore,
    setSavings,
    filterOption,
    startDate || undefined,
    endDate || undefined,
    [savingsContributionStore, filterOption, startDate, endDate]
  );
  useSumDataByTimeframe(
    workerExpense,
    expenseStore,
    setExpenses,
    filterOption,
    startDate || undefined,
    endDate || undefined,
    [expenseStore, filterOption, startDate, endDate]
  );

  const dataLoadStatus: Record<txn_summary, sumByTransaction | null> = {
    [txn_summary.Balance]: expenses && income && savings,
    [txn_summary.Expenses]: expenses,
    [txn_summary.Budget]: budget,
    [txn_summary.Income]: income,
    [txn_summary.Savings]: savings,
  };

  //add loading every filter change after initial load
  useEffect(() => {
    if (dataLoadStatus) {
      setLoading(true);

      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  }, [filterOption]);
  const filterTitle = getFilterTitle(filterOption, startDate, endDate);
  return (
    <>
      <Container maxWidth={false} sx={{ p: 1 }}>
        <FilterTitleAndIcon timeframe={filterTitle} title="Overview" onfilterClick={handleFilterClick} />
      </Container>
      <Box sx={{ overflow: "hidden", pt: 0.5, px: { xs: 0, md: 3 } }}>
        <Swiper slidesPerGroup={1} spaceBetween={10} breakpoints={swiperBreakpointsConfig}>
          {Object.values(txn_summary).map((type, index) => {
            const { icon, color } = typeIconColor(type, theme, isDarkMode);
            const incomeSum = income?.sum ?? 0;
            const incomePrevSum = income?.prevSum ?? 0;
            const expenseSum = expenses?.sum ?? 0;
            const expensePrevSum = expenses?.prevSum ?? 0;
            const budgetSum = budget?.sum ?? 0;
            const budgetPrevSum = budget?.prevSum ?? 0;
            const contributionSum = savings?.sum ?? 0;
            const contributionPrevSum = savings?.prevSum ?? 0;
            const prevDate = expenses?.prevDate ?? income?.prevDate ?? savings?.prevDate ?? "";

            const currentSUM = calculateCurrentSum(type, incomeSum, expenseSum, contributionSum, budgetSum);
            const prevSUM = calculatePrevSum(type, incomePrevSum, expensePrevSum, contributionPrevSum, budgetPrevSum);
            const previousDate = prevDate;
            const percentageIncrease = calculatePercentageIncrease(currentSUM, prevSUM);
            const percentagecolor = determinePercentageColor(percentageIncrease);
            const percentageSTR = determinePercentageStr(percentageIncrease, currentSUM, prevSUM);
            const percentageIcon = determinePercentageIcon(percentageIncrease, currentSUM, prevSUM);
            return (
              <SwiperSlide key={index}>
                <Paper sx={paperStyle} variant={isDarkMode ? "elevation" : "outlined"}>
                  <TransactionOverviewItems
                    color={color}
                    icon={icon}
                    type={type}
                    isDarkMode={isDarkMode}
                    dataLoadStatus={dataLoadStatus}
                    percentageIcon={percentageIcon}
                    currentSUM={currentSUM}
                    prevSUM={prevSUM}
                    percentagecolor={percentagecolor}
                    filterOption={filterOption}
                    prevDate={previousDate}
                    percentageSTR={percentageSTR}
                    filterTitle={filterTitle}
                    networth={{
                      expenseSum: expenseSum || 0,
                      incomeSum: incomeSum || 0,
                      contributionSum: contributionSum || 0,
                    }}
                    startDate={startDate}
                    endDate={endDate}
                    openInfoDialog={() => setOpenInfoDialog(true)}
                    loading={loading}
                  />
                </Paper>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </Box>
      <GenericDialog
        open={openInfoDialog}
        handleClose={() => setOpenInfoDialog(false)}
        title="Networth Calculation"
        content={
          <>
            <Typography variant="body1" mt={2}>
              Income - Expense - Savings Contributions
            </Typography>
          </>
        }
      />
      <FilterActionsComponent
        filterOpen={filterOpen}
        anchorEl={anchorEl}
        handleFilterClose={handleFilterClose}
        customMonthOpen={customMonthOpen}
        customYearOpen={customYearOpen}
        handleFilterOptionChange={handleFilterOptionChange}
        handleCloseForm={handleCloseForm}
        handleMonthFilter={handleMonthFilter}
        handleYearFilter={handleYearFilter}
        selectedTimeframe={filterOption}
      />
    </>
  );
};

export default React.memo(TransactionOverview);
