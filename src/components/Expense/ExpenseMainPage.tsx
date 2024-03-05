import { Dialog, DialogContent, Grid, Paper, useTheme } from "@mui/material";
import { ThunkDispatch } from "@reduxjs/toolkit";
import { Timestamp } from "firebase/firestore";
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { operation_types, txn_types } from "../../constants/collections";
import { SORT_TYPE } from "../../constants/constants";
import { FORM_WIDTH } from "../../constants/size";
import { FilterTimeframe } from "../../constants/timeframes";
import { useAccountTypeContext } from "../../contextAPI/AccountTypeContext";
import { useCategoryContext } from "../../contextAPI/CategoryContext";
import { useTransactionLogsContext } from "../../contextAPI/TransactionLogsContext";
import { getCategoryAndAccountTypeDescription } from "../../firebase/utils";
import { filterDataByDateRange } from "../../helper/GenericTransactionHelper";
import { TimestamptoDate } from "../../helper/date";
import { useTablePagination } from "../../hooks/paginationHook";
import useSnackbarHook from "../../hooks/snackbarHook";
import ExpenseModel from "../../models/ExpenseModel";
import TransactionLogsModel from "../../models/TransactionLogsModel";
import { deleteExpenseAction } from "../../redux/actions/expenseAction";
import { RootState } from "../../redux/store";
import ExpensebyCategoryTrend from "../Charts/Expenses/ExpensebyCategoryTrend";
import DeleteConfirmationDialog from "../Dialog/DeleteConfirmationDialog";
import UploadingDialog from "../Dialog/UploadingDialog";
import EntryFormSkeleton from "../Skeleton/EntryFormSkeleton";
import GenericChartSkeleton from "../Skeleton/GenericChartSkeleton";
import GenericTableSkeleton from "../Skeleton/GenericTableSkeleton";
import ExpenseList from "./ExpenseList";
import ExpenseListFooter from "./ExpenseListFooter";
import ExpenseListHeader from "./ExpenseListHeader";
const ExpenseForm = React.lazy(() => import("./ExpenseForm"));

const ExpenseMainPage = () => {
  const location = useLocation();
  const { openForm } = location.state || {};

  const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(openForm || false);
  const powerSavingMode = useSelector((state: RootState) => state.powerSaving.enabled);
  const [deleteFormOpen, setDeleteFormOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<ExpenseModel | ExpenseModel>();
  const [editMode, setEditMode] = useState(false);
  const { categories } = useCategoryContext();
  const { accountType } = useAccountTypeContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const { saveLogs } = useTransactionLogsContext();
  const { openSuccessSnackbar, SnackbarComponent } = useSnackbarHook();
  const [selectedCategory, setSelectedCategory] = useState<string[]>(["All Categories"]);
  const [sortBy, setSortBy] = useState(SORT_TYPE.date);
  const { page, rowsPerPage, handleChangePage, handleChangeRowsPerPage } = useTablePagination();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  const [editedExpense, setEditedExpense] = useState({} as ExpenseModel);
  const [selectedTimeframe, setSelectedTimeframe] = useState(FilterTimeframe.Year);

  const expenses = useSelector((state: RootState) => state.expenses.expenses);

  const dispatch = useDispatch<ThunkDispatch<any, any, any>>();

  const uploadCancelled = useSelector((state: RootState) => state.expenses.uploadCancelled);
  const isUploading = useSelector((state: RootState) => state.expenses.isUploading);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const isInDateRange =
        filterDataByDateRange([expense], "date", selectedTimeframe, startDate || undefined, endDate || undefined)
          .length > 0;
      const matchesSearch = expense.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory.includes("All Categories") ||
        selectedCategory.includes(getCategoryAndAccountTypeDescription(expense.category_id, categories));
      return isInDateRange && matchesSearch && matchesCategory;
    });
  }, [expenses, selectedTimeframe, startDate, endDate, searchQuery, selectedCategory, categories]);

  const filteredAndSortedExpenses = useMemo(() => {
    return [...filteredExpenses].sort((a, b) => {
      if (sortBy === SORT_TYPE.date) {
        return b.date.toDate().getTime() - a.date.toDate().getTime();
      } else if (sortBy === SORT_TYPE.amount) {
        return b.amount - a.amount;
      }
      return 0; // Default case if sortBy is not 'date' or 'amount'
    });
  }, [filteredExpenses, sortBy]);

  const paginatedExpenses = filteredAndSortedExpenses.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const searchQueryRef = useRef(searchQuery);
  // go to page 1 when searching or if there are no search results
  useEffect(() => {
    if (searchQuery.length > 0 && searchQuery !== searchQueryRef.current) {
      handleChangePage(null, 0);
    } else if (filteredExpenses.length === 0 && page !== 0) {
      handleChangePage(null, 0);
    }
    searchQueryRef.current = searchQuery;
  }, [searchQuery, handleChangePage, filteredExpenses.length, page]);

  const filteredExpensesRef = useRef(filteredExpenses);

  // go to page 1 when filtering
  useEffect(() => {
    if (filteredExpenses !== filteredExpensesRef.current) {
      handleChangePage(null, 0);
    }
    filteredExpensesRef.current = filteredExpenses;
  }, [filteredExpenses]);

  /// FILTER  ////////////////////////////////////////////////////////////////////
  const handleDateFilterChange = (filterOption: FilterTimeframe, startDate?: Date, endDate?: Date) => {
    if (startDate && endDate) {
      setStartDate(startDate);
      setEndDate(endDate);
    }
    setSelectedTimeframe(filterOption);
  };

  /// ADD ////////////////////////////////////////////////////////////////////////
  const handleUpdateExpense = async () => {
    if (editMode) {
      handleCloseForm();
    }

    openSuccessSnackbar(`Expense has been ${editMode ? "Updated" : "Added"}`);
  };
  /// SEARCH  ////////////////////////////////////////////////////////////////////
  const handleSearchChange = (searchitem: string) => {
    setSearchQuery(searchitem);
  };

  ///  EDIT   ///////////////////////////////////////////////////////////////////
  const handleEditExpense = (expense: ExpenseModel) => {
    setEditedExpense({ ...expense });
    setEditMode(true);
    setIsExpenseFormOpen(true);
  };
  ///  DELETE  //////////////////////////////////////////////////////////////////
  const handleDeleteExpense = async () => {
    handleCloseForm();
    if (expenseToDelete) {
      if (!expenseToDelete.id) {
        console.error("Failed to delete expense, undefined id");
        return;
      }

      const log: TransactionLogsModel = {
        txn_id: "",
        txn_ref_id: expenseToDelete.id,
        txn_type: txn_types.Expenses,
        operation: operation_types.Delete,
        category_id: expenseToDelete.category_id,
        account_id: expenseToDelete.account_id,
        amount: expenseToDelete.amount,
        lastModified: Timestamp.now(),
      };

      await saveLogs(log);
      await dispatch(deleteExpenseAction(expenseToDelete));

      openSuccessSnackbar("Expense has been deleted!");
    } else {
      console.log("Delete failed, missing argument");
    }
  };
  /// EXPENSE ENTRY FORM MODAL/////////////////////////////////////////////////////////
  const openExpenseForm = () => {
    setIsExpenseFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsExpenseFormOpen(false);
    setDeleteFormOpen(false);
    setEditMode(false);
  };

  const handleDeleteClick = (expense: ExpenseModel) => {
    setDeleteFormOpen(true);
    setExpenseToDelete(expense);
  };

  const handleCategoryChange = (category: string[]) => {
    setSelectedCategory(category);
  };
  const handleSortChange = (sortBy: SORT_TYPE) => {
    setSortBy(sortBy);
  };
  const gridContainerRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (gridContainerRef.current) {
      gridContainerRef.current.scrollIntoView();
    }
  }, []);
  return (
    <Grid container spacing={{ xs: 1, sm: 1.5, lg: 2 }} pb={{ xs: 10, md: 5 }} ref={gridContainerRef}>
      <Grid item xs={12} lg={12}>
        <Paper elevation={isDarkMode ? 1 : 0} sx={{ borderRadius: 4 }} variant={isDarkMode ? "elevation" : "outlined"}>
          {isUploading && !uploadCancelled ? (
            <GenericChartSkeleton />
          ) : (
            <ExpensebyCategoryTrend
              title="Expenses"
              onDateFilterChange={handleDateFilterChange}
              onCategoryChange={handleCategoryChange}
            />
          )}
        </Paper>
      </Grid>

      <Grid item xs={12}>
        <Paper sx={{ borderRadius: 4, p: 1 }} variant={isDarkMode ? "elevation" : "outlined"}>
          <ExpenseListHeader
            onSearch={handleSearchChange}
            onformOpen={openExpenseForm}
            onSortChange={handleSortChange}
          />

          {isUploading && !uploadCancelled ? (
            <GenericTableSkeleton />
          ) : (
            <ExpenseList
              filteredExpenses={paginatedExpenses}
              onDeleteExpense={handleDeleteClick}
              onEditExpense={handleEditExpense}
            />
          )}

          <ExpenseListFooter
            filteredAndSortedExpenses={filteredAndSortedExpenses}
            filteredExpenses={filteredExpenses}
            startDate={startDate}
            endDate={endDate}
            selectedTimeframe={selectedTimeframe}
            rowsPerPage={rowsPerPage}
            page={page}
            handleChangePage={handleChangePage}
            handleChangeRowsPerPage={handleChangeRowsPerPage}
          />
        </Paper>
      </Grid>

      <Dialog
        open={isExpenseFormOpen}
        PaperProps={{
          sx: { borderRadius: 4, background: isDarkMode ? "#1e1e1e" : "#fff", width: FORM_WIDTH },
        }}
        transitionDuration={powerSavingMode ? 0 : undefined}
      >
        <DialogContent sx={{ px: 3, py: 1 }}>
          <React.Suspense fallback={<EntryFormSkeleton />}>
            <ExpenseForm
              categoryContext={categories}
              accountType={accountType}
              onUpdateExpense={handleUpdateExpense}
              editExpense={editedExpense}
              isEditMode={editMode}
              onCloseForm={handleCloseForm}
            />
          </React.Suspense>
        </DialogContent>
      </Dialog>

      {SnackbarComponent}

      <UploadingDialog type="Expenses" isLoading={isUploading && !uploadCancelled} />
      <DeleteConfirmationDialog
        isDialogOpen={deleteFormOpen}
        onClose={handleCloseForm}
        onDelete={handleDeleteExpense}
        description={expenseToDelete?.description || " "}
      />
    </Grid>
  );
};

export default React.memo(ExpenseMainPage);
