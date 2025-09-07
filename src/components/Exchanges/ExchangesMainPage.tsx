import { Backdrop, CircularProgress, Grid, Paper, useTheme } from "@mui/material";
import { ThunkDispatch } from "@reduxjs/toolkit";
import { Timestamp } from "firebase/firestore";
import React, { useLayoutEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { SORT_TYPE } from "../../constants/constants";
import { FilterTimeframe } from "../../constants/timeframes";
import { useCategoryContext } from "../../contextAPI/CategoryContext";
import { useIncomeSourcesContext } from "../../contextAPI/IncomeSourcesContext";
import { useTransactionLogsContext } from "../../contextAPI/TransactionLogsContext";
import { filterDataByDateRange } from "../../helper/GenericTransactionHelper";
import { getFilterTitle } from "../../helper/utils";
import useSnackbarHook from "../../hooks/snackbarHook";
import ExpenseModel from "../../models/ExpenseModel";
import IncomeModel from "../../models/IncomeModel";
import { RootState } from "../../redux/store";
import ExchangesTrend from "../Charts/Exchanges/ExchangesByCategoryTrend";
import DeleteConfirmationDialog from "../Dialog/DeleteConfirmationDialog";
import { deleteincomeAction } from "../../redux/actions/incomeAction";
import { deleteExpenseAction } from "../../redux/actions/expenseAction";
import { operation_types, txn_types } from "../../constants/collections";
import TransactionLogsModel from "../../models/TransactionLogsModel";
import ExchangesList from "./ExchangesList";
import ExchangesListHeader from "./ExchangesListHeader";
const ExchangesMainPage = () => {
  const [deleteFormOpen, setDeleteFormOpen] = useState(false);
  const [selectedPairForDelete, setSelectedPairForDelete] = useState<ExchangePair | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const { saveLogs } = useTransactionLogsContext();
  const dispatch = useDispatch<ThunkDispatch<any, any, any>>();
  const [selectedTimeframe, setSelectedTimeframe] = useState(FilterTimeframe.Year);
  const [sortBy, setSortBy] = useState(SORT_TYPE.date);
  const incomeSlice = useSelector((state: RootState) => state.income.income);
  const expenseSlice = useSelector((state: RootState) => state.expenses.expenses);
  const { incomeSource } = useIncomeSourcesContext();
  const { categories } = useCategoryContext();
  const { openSuccessSnackbar, SnackbarComponent } = useSnackbarHook();
  const swapIncomeSourceId = useMemo(() => {
    return (
      incomeSource.find((source) => source.description === "Swap Account")?.id || ""
    );
  }, [incomeSource]);

  const swapOnlyIncome = useMemo(() => {
    if (!swapIncomeSourceId) return [] as IncomeModel[];
    return incomeSlice.filter((i) => i.category_id === swapIncomeSourceId);
  }, [incomeSlice, swapIncomeSourceId]);

  const filteredIncomeByTimeframe = useMemo(
    () =>
      filterDataByDateRange<IncomeModel>(
        swapOnlyIncome,
        "date",
        selectedTimeframe,
        startDate || undefined,
        endDate || undefined
      ),
    [swapOnlyIncome, selectedTimeframe, startDate, endDate]
  );
  const swapExpenseCategoryId = useMemo(() => {
    return categories.find((c) => c.description === "Swap Account")?.id || "";
  }, [categories]);

  const swapOnlyExpenses = useMemo(() => {
    if (!swapExpenseCategoryId) return [] as ExpenseModel[];
    return expenseSlice.filter((exp: ExpenseModel) => exp.category_id === swapExpenseCategoryId);
  }, [expenseSlice, swapExpenseCategoryId]);

  const filteredExpensesByTimeframe = useMemo(
    () =>
      filterDataByDateRange<ExpenseModel>(
        swapOnlyExpenses,
        "date",
        selectedTimeframe,
        startDate || undefined,
        endDate || undefined
      ),
    [swapOnlyExpenses, selectedTimeframe, startDate, endDate]
  );

  type ExchangeItem = {
    id: string;
    amount: number; // signed
    description: string;
    account_id: string;
    date: Timestamp;
    category_id: string;
    kind: "income" | "expense";
  };

  const mergedExchanges: ExchangeItem[] = useMemo(() => {
    const positives: ExchangeItem[] = filteredIncomeByTimeframe.map((i) => ({
      id: i.id,
      amount: i.amount,
      description: i.description,
      account_id: i.account_id,
      date: i.date,
      category_id: i.category_id,
      kind: "income",
    }));
    const negatives: ExchangeItem[] = filteredExpensesByTimeframe.map((e) => ({
      id: e.id,
      amount: -Math.abs(e.amount),
      description: e.description,
      account_id: e.account_id,
      date: e.date,
      category_id: e.category_id,
      kind: "expense",
    }));
    return [...positives, ...negatives];
  }, [filteredIncomeByTimeframe, filteredExpensesByTimeframe]);

  // Pair exchanges: expense (from) to income (to) using exact timestamp match (ts key)
  type ExchangePair = {
    expenseId: string;
    incomeId: string;
    from_account_id: string;
    to_account_id: string;
    from_category_id: string;
    to_income_source_id: string;
    amount: number;
    date: Timestamp; // matched timestamp
    tsMs: number; // exact timestamp (milliseconds) used as correlation key
    feeAmount?: number;
  };

  const exchangePairs: ExchangePair[] = useMemo(() => {
    const expenses = mergedExchanges.filter((e) => e.kind === "expense");
    const incomes = mergedExchanges.filter((e) => e.kind === "income");

    // Index expenses by exact timestamp
    const expenseBucketsByTs = new Map<number, ExchangeItem[]>();
    expenses.forEach((e) => {
      const tsKey = e.date.toDate().getTime();
      const arr = expenseBucketsByTs.get(tsKey) || [];
      arr.push(e);
      expenseBucketsByTs.set(tsKey, arr);
    });

    const pairs: ExchangePair[] = [];
    incomes.forEach((inc) => {
      const tsKey = inc.date.toDate().getTime();
      const bucket = expenseBucketsByTs.get(tsKey);
      if (bucket && bucket.length > 0) {
        const exp = bucket.shift() as ExchangeItem;
        // try to find a related fee expense at the exact same timestamp
        const feeCandidate = filteredExpensesByTimeframe.find((e) => {
          return (
            e.date.toDate().getTime() === tsKey &&
            /fee/i.test(e.description)
          );
        });
        pairs.push({
          expenseId: exp.id,
          incomeId: inc.id,
          from_account_id: exp.account_id,
          to_account_id: inc.account_id,
          from_category_id: exp.category_id,
          to_income_source_id: inc.category_id,
          amount: Math.abs(inc.amount),
          date: inc.date,
          tsMs: tsKey,
          feeAmount: feeCandidate ? Math.abs(feeCandidate.amount) : undefined,
        });
        if (bucket.length === 0) expenseBucketsByTs.delete(tsKey);
      }
    });
    return pairs;
  }, [mergedExchanges, filteredExpensesByTimeframe]);
  
  const handleCloseForm = () => {
    setDeleteFormOpen(false);
  };

  ///  DELETE  //////////////////////////////////////////////////////////////////
  const handleDelete = async () => {
    handleCloseForm();
    if (!selectedPairForDelete) return;
    try {
      setIsLoading(true);
      // Delete income leg first
      await saveLogs({
        txn_id: "",
        txn_ref_id: selectedPairForDelete.incomeId,
        txn_type: txn_types.Income,
        operation: operation_types.Delete,
        category_id: selectedPairForDelete.to_income_source_id,
        account_id: selectedPairForDelete.to_account_id,
        amount: selectedPairForDelete.amount,
        lastModified: Timestamp.now(),
      } as TransactionLogsModel);
      await dispatch(deleteincomeAction(selectedPairForDelete.incomeId));

      // Delete expense leg using exact timestamp match (fallback to id)
      const swapExpenseCategoryId = categories.find((c) => c.description === "Swap Account")?.id || "";
      let expenseLeg = expenseSlice.find(
        (e: ExpenseModel) => e.date.toDate().getTime() === selectedPairForDelete.tsMs && e.category_id === swapExpenseCategoryId && !/fee/i.test(e.description)
      );
      if (!expenseLeg) {
        expenseLeg = expenseSlice.find((e: ExpenseModel) => e.id === selectedPairForDelete.expenseId);
      }
      if (expenseLeg) {
        await saveLogs({
          txn_id: "",
          txn_ref_id: expenseLeg.id,
          txn_type: txn_types.Expenses,
          operation: operation_types.Delete,
          category_id: expenseLeg.category_id,
          account_id: expenseLeg.account_id,
          amount: expenseLeg.amount,
          lastModified: Timestamp.now(),
        } as TransactionLogsModel);
        await dispatch(deleteExpenseAction(expenseLeg));
      }

      // Delete related fee if any, matched by same exact timestamp
      const feeCandidate = expenseSlice.find((e: ExpenseModel) => {
        if (e.category_id !== swapExpenseCategoryId) return false;
        if (!/fee/i.test(e.description)) return false;
        return e.date.toDate().getTime() === selectedPairForDelete.tsMs;
      });
      if (feeCandidate) {
        await saveLogs({
          txn_id: "",
          txn_ref_id: feeCandidate.id,
          txn_type: txn_types.Expenses,
          operation: operation_types.Delete,
          category_id: feeCandidate.category_id,
          account_id: feeCandidate.account_id,
          amount: feeCandidate.amount,
          lastModified: Timestamp.now(),
        } as TransactionLogsModel);
        await dispatch(deleteExpenseAction(feeCandidate));
      }

      openSuccessSnackbar("Exchange (income, expense, and fee if any) deleted!");
    } catch (error) {
      console.error("Exchange delete failed", error);
    } finally {
      setIsLoading(false);
    }
  };



  const handleDateFilterChange = (filterOption: FilterTimeframe, startDate?: Date, endDate?: Date) => {
    if (startDate && endDate) {
      setStartDate(startDate);
      setEndDate(endDate);
    }
    setSelectedTimeframe(filterOption);
  };

  const handleSortChange = (sortBy: SORT_TYPE) => {
    setSortBy(sortBy);
  };
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  const gridContainerRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (gridContainerRef.current) {
      gridContainerRef.current.scrollIntoView();
    }
  }, []);
  return (
    <>
      <Backdrop open={isLoading} sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <Grid container spacing={{ xs: 1, sm: 1.5, lg: 2 }} pb={{ xs: 10, md: 5 }} ref={gridContainerRef}>
        <Grid item xs={12} lg={12}>
          <Paper sx={{ borderRadius: 2 }} variant={isDarkMode ? "elevation" : "outlined"}>
            {(() => {
              // Build chart data using only paired exchanges, excluding fees and duplicates
              const chartExchanges = exchangePairs.map((p) => ({
                id: p.incomeId,
                amount: p.amount,
                description: `${p.from_account_id} -> ${p.to_account_id}`,
                account_id: p.to_account_id,
                date: p.date,
                category_id: p.to_income_source_id,
                kind: "income" as const,
              }));
              return (
                <ExchangesTrend exchanges={chartExchanges} onDateFilterChange={handleDateFilterChange} />
              );
            })()}
          </Paper>
        </Grid>

        <Grid item xs={12} lg={12}>
          <Paper sx={{ p: 1, borderRadius: 2 }} variant={isDarkMode ? "elevation" : "outlined"}>
            <ExchangesListHeader onSortChange={handleSortChange} />
            <ExchangesList
              exchangePairs={exchangePairs}
              sortBy={sortBy}
              filterDate={getFilterTitle(selectedTimeframe, startDate || null, endDate || null)}
              onDeleteExchange={(pair) => {
                setSelectedPairForDelete(pair);
                setDeleteFormOpen(true);
              }}
            />
          </Paper>
        </Grid>
      </Grid>

      {SnackbarComponent}

      <DeleteConfirmationDialog
        isDialogOpen={deleteFormOpen}
        onClose={handleCloseForm}
        onDelete={handleDelete}
        description={""}
      />
    </>
  );
};

export default React.memo(ExchangesMainPage);
