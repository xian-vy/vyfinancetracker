import { Dialog, DialogContent, Grid, Paper, useTheme } from "@mui/material";
import { ThunkDispatch } from "@reduxjs/toolkit";
import { Timestamp } from "firebase/firestore";
import React, { useLayoutEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { filterDataByDateRange } from "../../helper/GenericTransactionHelper";
import { TimestamptoDate } from "../../helper/date";
import { getFilterTitle } from "../../helper/utils";
import { FORM_WIDTH } from "../../constants/size";
import { operation_types, txn_types } from "../../constants/collections";
import { FilterTimeframe } from "../../constants/timeframes";
import { useIncomeSourcesContext } from "../../contextAPI/IncomeSourcesContext";
import { useTransactionLogsContext } from "../../contextAPI/TransactionLogsContext";
import { getCategoryAndAccountTypeDescription } from "../../firebase/utils";
import useSnackbarHook from "../../hooks/snackbarHook";
import IncomeModel from "../../models/IncomeModel";
import TransactionLogsModel from "../../models/TransactionLogsModel";
import { deleteincomeAction } from "../../redux/actions/incomeAction";
import { RootState } from "../../redux/store";
import IncomeTrend from "../Charts/Income/IncomebyCategoryTrend";
import DeleteConfirmationDialog from "../Dialog/DeleteConfirmationDialog";
import LoadingDialog from "../Dialog/LoadingDialog";
import IncomeList from "./IncomeList";
import IncomeTableHeader from "./IncomeTableHeader";
import EntryFormSkeleton from "../Skeleton/EntryFormSkeleton";
import { SORT_TYPE } from "../../constants/constants";
const IncomeForm = React.lazy(() => import("./IncomeForm"));
const IncomeMainPage = () => {
  const location = useLocation();
  const { openForm } = location.state || {};
  const powerSavingMode = useSelector((state: RootState) => state.powerSaving.enabled);

  const [deleteFormOpen, setDeleteFormOpen] = useState(false);
  const [incomeToDelete, setIncomeToDelete] = useState<IncomeModel>();
  const [isLoading, setIsLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [isIncomeFormOpen, setIsIncomeFormOpen] = useState(openForm || false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const { saveLogs } = useTransactionLogsContext();
  const dispatch = useDispatch<ThunkDispatch<any, any, any>>();
  const [selectedTimeframe, setSelectedTimeframe] = useState(FilterTimeframe.Year);
  const [sortBy, setSortBy] = useState(SORT_TYPE.date);

  const { incomeSource } = useIncomeSourcesContext();

  const incomeSlice = useSelector((state: RootState) => state.income.income);

  const { openSuccessSnackbar, SnackbarComponent } = useSnackbarHook();

  const [income, setIncome] = useState<IncomeModel>({
    id: "",
    amount: 800,
    category_id: "",
    date: Timestamp.now(),
    description: "",
    account_id: "",
  });

  const filteredByTimeframe = useMemo(
    () => filterDataByDateRange(incomeSlice, "date", selectedTimeframe, startDate || undefined, endDate || undefined),
    [incomeSlice, selectedTimeframe, startDate, endDate]
  );
  //BUDGET FORM MODAL//////////////////////////////////////////////////////////////////////////

  const openBudgetForm = () => {
    setIsIncomeFormOpen(true);
  };

  const handleCloseForm = () => {
    setEditMode(false);
    setIsIncomeFormOpen(false);
    setDeleteFormOpen(false);
  };

  const handleSaveUpdate = (operation: string) => {
    if (editMode) {
      handleCloseForm();
    }

    openSuccessSnackbar(`Income has been ${operation === "Create" ? "Added" : "Updated"}`);
  };
  ///  DELETE  //////////////////////////////////////////////////////////////////
  const handleDeleteIncome = async () => {
    handleCloseForm();

    try {
      setIsLoading(true);
      if (incomeToDelete) {
        const log: TransactionLogsModel = {
          txn_id: "",
          txn_ref_id: incomeToDelete.id,
          txn_type: txn_types.Income,
          operation: operation_types.Delete,
          category_id: incomeToDelete.category_id,
          account_id: incomeToDelete.account_id,
          amount: incomeToDelete.amount,
          lastModified: Timestamp.now(),
        };

        await saveLogs(log);
        await dispatch(deleteincomeAction(incomeToDelete.id));
      } else {
        console.log("Delete failed, missing argument");
      }
    } catch (error) {
      console.log("Income delete failed", error);
    } finally {
      setIsLoading(false);
    }
    openSuccessSnackbar("Income has been deleted!");
  };

  const handleDeleteClick = (income: IncomeModel) => {
    setDeleteFormOpen(true);
    setIncomeToDelete(income);
  };

  ///  EDIT   ///////////////////////////////////////////////////////////////////
  const handleEditBudget = (income: IncomeModel) => {
    setIncome({ ...income });
    setEditMode(true);
    setIsIncomeFormOpen(true);
  };

  const handleFilterOption = (filterOption: FilterTimeframe, startDate?: Date, endDate?: Date) => {
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
      <Grid container spacing={{ xs: 1, sm: 1.5, lg: 2 }} pb={{ xs: 10, md: 5 }} ref={gridContainerRef}>
        <Grid item xs={12} lg={12}>
          <Paper sx={{ borderRadius: 4 }} variant={isDarkMode ? "elevation" : "outlined"}>
            <IncomeTrend incomes={incomeSlice} />
          </Paper>
        </Grid>

        <Grid item xs={12} lg={12}>
          <Paper sx={{ p: 1, borderRadius: 4 }} variant={isDarkMode ? "elevation" : "outlined"}>
            <IncomeTableHeader
              onOpenForm={openBudgetForm}
              onfilterChange={handleFilterOption}
              onSortChange={handleSortChange}
            />
            <IncomeList
              income={filteredByTimeframe}
              onDeleteIncome={handleDeleteClick}
              onEditIncome={handleEditBudget}
              sortBy={sortBy}
              filterDate={getFilterTitle(selectedTimeframe, startDate || null, endDate || null)}
            />
          </Paper>
        </Grid>
      </Grid>

      <Dialog
        open={isIncomeFormOpen}
        PaperProps={{
          sx: { borderRadius: 4, background: isDarkMode ? "#1e1e1e" : "#fff", width: FORM_WIDTH },
        }}
        transitionDuration={powerSavingMode ? 0 : undefined}
      >
        <DialogContent sx={{ px: 3, py: 1 }}>
          <React.Suspense fallback={<EntryFormSkeleton />}>
            <IncomeForm
              editIncome={income}
              onCloseForm={handleCloseForm}
              isEditMode={editMode}
              onUpdate={handleSaveUpdate}
            />
          </React.Suspense>
        </DialogContent>
      </Dialog>

      {SnackbarComponent}

      <LoadingDialog isLoading={isLoading} />
      <DeleteConfirmationDialog
        isDialogOpen={deleteFormOpen}
        onClose={handleCloseForm}
        onDelete={handleDeleteIncome}
        description={incomeToDelete?.description || ""}
        date={TimestamptoDate(incomeToDelete?.date || Timestamp.now(), "MMM dd, yyyy")}
        description2={getCategoryAndAccountTypeDescription(incomeToDelete?.category_id || "", incomeSource)}
      />
    </>
  );
};

export default React.memo(IncomeMainPage);
