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
  const [exchangeToDelete, setExchangeToDelete] = useState<{ id: string; amount: number; description: string; account_id: string; date: Timestamp; category_id: string; kind: "income" | "expense" } | null>(null);
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
    return expenseSlice.filter((e) => e.category_id === swapExpenseCategoryId);
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
  
  const handleCloseForm = () => {
    setDeleteFormOpen(false);
  };

  ///  DELETE  //////////////////////////////////////////////////////////////////
  const handleDelete = async () => {
    handleCloseForm();
    if (!exchangeToDelete) return;
    try {
      setIsLoading(true);
      const isExpense = exchangeToDelete.kind === "expense" || exchangeToDelete.amount < 0;

      const log: TransactionLogsModel = {
        txn_id: "",
        txn_ref_id: exchangeToDelete.id,
        txn_type: isExpense ? txn_types.Expenses : txn_types.Income,
        operation: operation_types.Delete,
        category_id: exchangeToDelete.category_id,
        account_id: exchangeToDelete.account_id,
        amount: Math.abs(exchangeToDelete.amount),
        lastModified: Timestamp.now(),
      };

      await saveLogs(log);
      if (isExpense) {
        await dispatch(deleteExpenseAction({
          id: exchangeToDelete.id,
          description: exchangeToDelete.description,
          amount: Math.abs(exchangeToDelete.amount),
          date: exchangeToDelete.date,
          account_id: exchangeToDelete.account_id,
          category_id: exchangeToDelete.category_id,
        } as ExpenseModel));
      } else {
        await dispatch(deleteincomeAction(exchangeToDelete.id));
      }
      openSuccessSnackbar("Exchange has been deleted!");
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
            <ExchangesTrend exchanges={mergedExchanges} onDateFilterChange={handleDateFilterChange} />
          </Paper>
        </Grid>

        <Grid item xs={12} lg={12}>
          <Paper sx={{ p: 1, borderRadius: 2 }} variant={isDarkMode ? "elevation" : "outlined"}>
            <ExchangesListHeader onSortChange={handleSortChange} />
            <ExchangesList
              exchanges={mergedExchanges}
              sortBy={sortBy}
              filterDate={getFilterTitle(selectedTimeframe, startDate || null, endDate || null)}
              onDeleteExchange={(item) => { setExchangeToDelete(item); setDeleteFormOpen(true); }}
            />
          </Paper>
        </Grid>
      </Grid>

      {SnackbarComponent}

      <DeleteConfirmationDialog
        isDialogOpen={deleteFormOpen}
        onClose={handleCloseForm}
        onDelete={handleDelete}
        description={exchangeToDelete?.description || ""}
      />
    </>
  );
};

export default React.memo(ExchangesMainPage);
