import { Box, CircularProgress, Container, Paper, useTheme } from "@mui/material";
import Typography from "@mui/material/Typography";
import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";
import { txn_summary } from "../../constants/collections";
import { COMPONENTS_WITH_TIMEFRAME } from "../../constants/constants";
import { distributeBudgetAmounts } from "../../helper/BudgetHelper";
import { getFilterTitle } from "../../helper/utils";
import { useFilterHandlers } from "../../hooks/filterHook";
import { useSumDataByTimeframe } from "../../hooks/sumDataByTimeframeHook";
import { RootState } from "../../redux/store";
import GenericDialog from "../Dialog/GenericDialog";
import FilterActionsComponent from "../Filter/FilterActionsComponent";
import FilterTitleAndIcon from "../Filter/FilterTitleAndIcon";
import {
  swiperBreakpointsConfig,
  typeIconColor
} from "./TransactionOverviewHelper";
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
  } = useFilterHandlers(COMPONENTS_WITH_TIMEFRAME.DASHBOARD_OVERVIEW);

  const budgetStore = useSelector((state: RootState) => state.budget.budgets);
  const incomeStore = useSelector((state: RootState) => state.income.income);
  const expenseStore = useSelector((state: RootState) => state.expenses.expenses);
  const savingsContributionStore = useSelector((state: RootState) => state.savingsContribution.contribution);

  const [budget, setBudget] = useState<sumByTransaction | null>(null);
  const [income, setIncome] = useState<sumByTransaction | null>(null);
  const [savings, setSavings] = useState<sumByTransaction | null>(null);
  const [expenses, setExpenses] = useState<sumByTransaction | null>(null);
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

  const isLoading = !budget || !income || !expenses || !savings;

  const filterTitle = getFilterTitle(filterOption, startDate, endDate);

  if (isLoading) {
    return (
      <>
      <Container maxWidth={false} sx={{ p: 1 }}>
        <FilterTitleAndIcon timeframe={filterTitle} title="Overview" onfilterClick={handleFilterClick} />
      </Container>
      <Box sx={{ display: 'flex', gap: 1 }}>
        {Object.values(txn_summary).map((type) => (
          <Paper key={type} sx={{ ...paperStyle,height:"120px", width:"300px",display:"flex",alignItems:"center",justifyContent:"center" }} variant={isDarkMode ? "elevation" : "outlined"}>
            <CircularProgress size={15} />
          </Paper>
        ))}
      </Box>
      </>
    );
  }
  return (
    <>
      <Container maxWidth={false} sx={{ p: 1 }}>
        <FilterTitleAndIcon timeframe={filterTitle} title="Overview" onfilterClick={handleFilterClick} />
      </Container>
      <Box sx={{ overflow: "hidden", pt: 0.5, px: { xs: 0, md: 3 } }}>
        <Swiper slidesPerGroup={1} spaceBetween={10} breakpoints={swiperBreakpointsConfig}>
          {Object.values(txn_summary).map((type, index) => {
            const { icon, color } = typeIconColor(type, theme, isDarkMode);
            const incomeSum = income.sum;
            const incomePrevSum = income.prevSum ;
            const expenseSum = expenses.sum ;
            const expensePrevSum = expenses.prevSum ;
            const budgetSum = budget.sum ;
            const budgetPrevSum = budget.prevSum ;
            const contributionSum = savings.sum ;
            const contributionPrevSum = savings.prevSum ;
            const prevDate = expenses.prevDate ;

        
            return (
              <SwiperSlide key={index}>
                <Paper sx={paperStyle} variant={isDarkMode ? "elevation" : "outlined"}>
                  <TransactionOverviewItems
                    data={{ 
                      isDarkMode,
                      color,
                      icon,
                      type, 
                      prevDate ,
                      filterOption,
                      filterTitle ,
                      startDate,
                      endDate
                    }}
                    networth={{
                      expenseSum: expenseSum || 0,
                      incomeSum: incomeSum || 0,
                      contributionSum: contributionSum || 0,
                    }}
                    sumAmounts={{
                      incomeSum: incomeSum ,
                      expenseSum: expenseSum,
                      contributionSum: contributionSum,
                      budgetSum: budgetSum,
                      incomePrevSum: incomePrevSum,
                      expensePrevSum: expensePrevSum,
                      contributionPrevSum: contributionPrevSum,
                      budgetPrevSum: budgetPrevSum,
                    }}                
                    openInfoDialog={() => setOpenInfoDialog(true)}
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
