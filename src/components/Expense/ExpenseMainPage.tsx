import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import {
  Button,
  Dialog,
  DialogContent,
  Divider,
  Grid,
  Hidden,
  Paper,
  Stack,
  TablePagination,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { ThunkDispatch } from "@reduxjs/toolkit";
import { Timestamp } from "firebase/firestore";
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { filterDataByDateRange } from "../../Helper/GenericTransactionHelper";
import { generateExpenseList } from "../../Helper/ReportHelper";
import { TimestamptoDate } from "../../Helper/date";
import { ThemeColor, getFilterTitle } from "../../Helper/utils";
import { FilterTimeframe } from "../../constants/timeframes";
import { operation_types, txn_types } from "../../constants/collections";
import { useAccountTypeContext } from "../../contextAPI/AccountTypeContext";
import { useCategoryContext } from "../../contextAPI/CategoryContext";
import { useTransactionLogsContext } from "../../contextAPI/TransactionLogsContext";
import { getCategoryAndAccountTypeDescription } from "../../firebase/utils";
import { useTablePagination } from "../../hooks/paginationHook";
import useSnackbarHook from "../../hooks/snackbarHook";
import ExpenseModel from "../../models/ExpenseModel";
import TransactionLogsModel from "../../models/TransactionLogsModel";
import { deleteExpenseAction } from "../../redux/actions/expenseAction";
import { RootState } from "../../redux/store";
import ExpensebyCategoryTrend from "../Charts/Expenses/ExpensebyCategoryTrend";
import DeleteConfirmationDialog from "../Dialog/DeleteConfirmationDialog";
import UploadingDialog from "../Dialog/UploadingDialog";
import GenericChartSkeleton from "../Skeleton/GenericChartSkeleton";
import GenericTableSkeleton from "../Skeleton/GenericTableSkeleton";
import ExpenseFileUpload from "./ExpenseFileUpload";
import ExpenseList from "./ExpenseList";
import ExpenseListTableHeader from "./ExpenseListTableHeader";
import { FORM_WIDTH } from "../../constants/Sizes";
import EntryFormSkeleton from "../Skeleton/EntryFormSkeleton";
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
  const [sortBy, setSortBy] = useState("date");
  const { page, rowsPerPage, handleChangePage, handleChangeRowsPerPage } = useTablePagination();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [editedExpense, setEditedExpense] = useState<ExpenseModel>({
    id: "",
    description: "",
    amount: 0,
    account_id: "",
    date: Timestamp.now(),
    category_id: "",
  });
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
      if (sortBy === "date") {
        return b.date.toDate().getTime() - a.date.toDate().getTime();
      } else if (sortBy === "amount") {
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
  const handleFilter = (filterOption: FilterTimeframe, startDate?: Date, endDate?: Date) => {
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
  const handleSortChange = (sortBy: string) => {
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
          {isUploading && !uploadCancelled ? <GenericChartSkeleton /> : <ExpensebyCategoryTrend title="Expenses" />}
        </Paper>
      </Grid>

      <Grid item xs={12}>
        <Paper sx={{ borderRadius: 4, p: 1 }} variant={isDarkMode ? "elevation" : "outlined"}>
          <ExpenseListTableHeader
            onSearch={handleSearchChange}
            onformOpen={openExpenseForm}
            onfilterChange={handleFilter}
            onCategoryChange={handleCategoryChange}
            selectedCategory={selectedCategory}
            onSortChange={handleSortChange}
            currentSort={sortBy}
          />

          {isUploading && !uploadCancelled ? (
            <GenericTableSkeleton />
          ) : (
            <>
              <ExpenseList
                filteredExpenses={paginatedExpenses}
                onDeleteExpense={handleDeleteClick}
                onEditExpense={handleEditExpense}
              />
            </>
          )}

          <Grid
            container
            direction="row"
            alignContent="center"
            justifyContent="space-between"
            alignItems="center"
            flexWrap="wrap"
          >
            <Stack direction="row" alignItems="center" height="100%">
              <ExpenseFileUpload />
              <Divider orientation="vertical" sx={{ height: 12, border: `solid 1px #666`, mx: 1.5 }} />
              <FileDownloadOutlinedIcon
                sx={{ fontSize: "16px" }}
                onClick={() =>
                  generateExpenseList(
                    filteredExpenses,
                    categories,
                    accountType,
                    getFilterTitle(selectedTimeframe, startDate || null, endDate || null)
                  )
                }
              />

              <Stack direction="row">
                <Hidden smDown>
                  <Button
                    component="span"
                    color="inherit"
                    onClick={() =>
                      generateExpenseList(
                        filteredExpenses,
                        categories,
                        accountType,
                        getFilterTitle(selectedTimeframe, startDate || null, endDate || null)
                      )
                    }
                    sx={{
                      color: ThemeColor(theme),
                      minWidth: { xs: 35, md: 40 },
                      textTransform: "none",
                      fontSize: "12px",
                    }}
                  >
                    Export
                  </Button>
                </Hidden>
              </Stack>
            </Stack>
            <TablePagination
              component="div"
              count={filteredAndSortedExpenses.length}
              page={filteredAndSortedExpenses.length <= 0 ? 0 : page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage={isSmallScreen ? "" : "Rows per Page:"}
              rowsPerPageOptions={[10, 50, 100, 300]}
            />
          </Grid>
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
        description2={getCategoryAndAccountTypeDescription(expenseToDelete?.category_id || "", categories)}
        date={TimestamptoDate(expenseToDelete?.date || Timestamp.now(), "MMM dd, yyyy")}
      />
    </Grid>
  );
};

export default React.memo(ExpenseMainPage);
