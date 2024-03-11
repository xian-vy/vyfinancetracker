import { Backdrop, CircularProgress, Dialog, DialogContent, Grid, Paper, useTheme } from "@mui/material";
import { ThunkDispatch } from "@reduxjs/toolkit";
import { Timestamp } from "firebase/firestore";
import React, { useLayoutEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { operation_types, txn_types } from "../../constants/collections";
import { SORT_TYPE } from "../../constants/constants";
import { FORM_WIDTH } from "../../constants/size";
import { FilterTimeframe } from "../../constants/timeframes";
import { useTransactionLogsContext } from "../../contextAPI/TransactionLogsContext";
import { filterDataByDateRange } from "../../helper/GenericTransactionHelper";
import { getFilterTitle } from "../../helper/utils";
import useSnackbarHook from "../../hooks/snackbarHook";
import IncomeModel from "../../models/IncomeModel";
import TransactionLogsModel from "../../models/TransactionLogsModel";
import { deleteincomeAction } from "../../redux/actions/incomeAction";
import { RootState } from "../../redux/store";
import IncomeTrend from "../Charts/Income/IncomebyCategoryTrend";
import DeleteConfirmationDialog from "../Dialog/DeleteConfirmationDialog";
import IncomeForm from "./IncomeForm";
import IncomeList from "./IncomeList";
import IncomeListHeader from "./IncomeListHeader";
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

  const openIncomeForm = () => {
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
          <Paper sx={{ borderRadius: 4 }} variant={isDarkMode ? "elevation" : "outlined"}>
            <IncomeTrend incomes={incomeSlice} onDateFilterChange={handleDateFilterChange} />
          </Paper>
        </Grid>

        <Grid item xs={12} lg={12}>
          <Paper sx={{ p: 1, borderRadius: 4 }} variant={isDarkMode ? "elevation" : "outlined"}>
            <IncomeListHeader onOpenForm={openIncomeForm} onSortChange={handleSortChange} />
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
          <IncomeForm
            editIncome={income}
            onCloseForm={handleCloseForm}
            isEditMode={editMode}
            onUpdate={handleSaveUpdate}
          />
        </DialogContent>
      </Dialog>

      {SnackbarComponent}

      <DeleteConfirmationDialog
        isDialogOpen={deleteFormOpen}
        onClose={handleCloseForm}
        onDelete={handleDeleteIncome}
        description={incomeToDelete?.description || ""}
      />
    </>
  );
};

export default React.memo(IncomeMainPage);
