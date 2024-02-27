import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ClearIcon from "@mui/icons-material/Clear";
import CloseIcon from "@mui/icons-material/Close";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import { Box, Button, Divider, IconButton, Stack, Typography } from "@mui/material";
import { DesktopDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { ThunkDispatch } from "@reduxjs/toolkit";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ASYNC_RESULT } from "../../constants/constants";
import { useCategoryContext } from "../../contextAPI/CategoryContext";
import { useTransactionLogsContext } from "../../contextAPI/TransactionLogsContext";
import useSnackbarHook from "../../hooks/snackbarHook";
import CategoryModel from "../../models/CategoryModel";
import { RootState } from "../../redux/store";
import EntryFormButton from "../GenericComponents/EntryFormButton";
import BudgetFormCategoryList from "./BudgetFormCategoryList";
import { budgetFormSubmit, checkForExistingBudget, copyPreviousBudget, getPreviousMonthYear } from "./BudgetFormHelper";
interface BudgetFormProps {
  onCloseForm: () => void;
}

const BudgetForm: React.FC<BudgetFormProps> = ({ onCloseForm }) => {
  const { openSuccessSnackbar, SnackbarComponent } = useSnackbarHook();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<CategoryModel[]>([]);
  const { categories: categoryContext } = useCategoryContext();
  const dispatch = useDispatch<ThunkDispatch<any, any, any>>();
  const budgetSlice = useSelector((state: RootState) => state.budget.budgets);
  const [isEditMode, setIsEditMode] = useState(false);
  const { saveBatchLogs } = useTransactionLogsContext();
  const powerSavingMode = useSelector((state: RootState) => state.powerSaving.enabled);
  const firstTextFieldRef = useRef<HTMLInputElement>(null);
  const [categoryAmounts, setCategoryAmounts] = useState<{ [categoryId: string]: number }>({});
  const [selectedMonth, setSelectedMonth] = React.useState(new Date());
  const [selectedYear, setSelectedYear] = React.useState(new Date());
  const totalAmount = Object.values(categoryAmounts).reduce((sum, amount) => sum + amount, 0);
  const canSave = typeof totalAmount === "number" && (totalAmount > 0 || isEditMode);

  useEffect(() => {
    setCategories(categoryContext);
  }, [categories]);

  useEffect(() => {
    const amounts = checkForExistingBudget(selectedMonth, budgetSlice);
    if (amounts) {
      setCategoryAmounts(amounts);
      setIsEditMode(true);
    } else {
      setCategoryAmounts({});
      setIsEditMode(false);
    }
  }, []);

  const handleAmountChange = (categoryId: string, value: string) => {
    if (value.length <= 8) {
      const amount = parseFloat(value.replace(/,/g, ""));
      setCategoryAmounts((prevAmounts) => ({
        ...prevAmounts,
        [categoryId]: isNaN(amount) ? 0 : amount,
      }));
    }
  };

  const handleCopyPreviousBudget = () => {
    const amounts = copyPreviousBudget(selectedMonth, budgetSlice);
    if (amounts) {
      setCategoryAmounts(amounts);
    } else {
      openSuccessSnackbar(`No budget to copy from previous month.`, true);
    }
  };

  const handleDateChange = (date: Date | null) => {
    if (date !== null) {
      const newMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      setSelectedMonth(newMonth);
      setSelectedYear(new Date(date.getFullYear(), date.getMonth() + 1, 0));
      const amounts = checkForExistingBudget(newMonth, budgetSlice);
      if (amounts) {
        setCategoryAmounts(amounts);
        setIsEditMode(true);
      } else {
        setCategoryAmounts({});
        setIsEditMode(false);
      }
    } else {
      console.log("Invalid Month/Year");
    }
  };

  const handleMonthChange = (change: number) => {
    setSelectedMonth((current) => {
      const newMonth = new Date(current.getFullYear(), current.getMonth() + change, 1);
      setSelectedYear(new Date(newMonth.getFullYear(), newMonth.getMonth(), 1));
      const amounts = checkForExistingBudget(newMonth, budgetSlice);
      if (amounts) {
        setCategoryAmounts(amounts);
        setIsEditMode(true);
      } else {
        setCategoryAmounts({});
        setIsEditMode(false);
      }
      return newMonth;
    });
  };

  const handleFormSubmit = useCallback(async () => {
    setIsLoading(true);
    const result = await budgetFormSubmit({
      isEditMode,
      selectedMonth,
      selectedYear,
      categoryAmounts,
      budgetSlice,
      dispatch,
      saveBatchLogs,
    });
    setIsLoading(false);
    if (result === ASYNC_RESULT.success) {
      if (!isEditMode) {
        setIsEditMode(true);
      }
      openSuccessSnackbar(`Budget has been ${isEditMode ? "Updated" : "Added"}`);
    } else if (result === ASYNC_RESULT.failed) {
      openSuccessSnackbar("An error occurred while submitting the budget.");
    } else if (result === ASYNC_RESULT.nochange) {
      openSuccessSnackbar("No changes were made to the budget.", true);
    } else if (result === ASYNC_RESULT.duplicate) {
      openSuccessSnackbar("A budget for the month already exists", true);
    }
  }, [isEditMode, selectedMonth, selectedYear, categoryAmounts, budgetSlice, dispatch, saveBatchLogs]);

  return (
    <>
      <Stack
        spacing={1.5}
        padding={1.5}
        component="form"
        onSubmit={(e) => {
          e.preventDefault();
          handleFormSubmit();
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6"> Budget Entry Form</Typography>
          <IconButton onClick={() => onCloseForm()} sx={{ mr: -1 }}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Date Picker-------------------------------------------------------------------------------------- */}
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Box display="flex" alignItems="center">
            <IconButton onClick={() => handleMonthChange(-1)} size="small">
              <ArrowBackIosNewIcon fontSize="small" />
            </IconButton>
            <DesktopDatePicker
              label=""
              views={["year", "month"]}
              value={selectedMonth}
              onChange={handleDateChange}
              slotProps={{
                textField: {
                  size: "small",
                },
              }}
              sx={{ mx: 1 }}
              reduceAnimations={powerSavingMode}
            />
            <IconButton onClick={() => handleMonthChange(1)} size="small">
              <ArrowForwardIosIcon fontSize="small" />
            </IconButton>
          </Box>
        </LocalizationProvider>
        <Divider />
        {/* Copy Prev Budget / Clear Button --------------------------------------------------------------------- */}
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Button
            variant="outlined"
            sx={{
              textTransform: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: 24,
              fontSize: "0.7rem",
            }}
            onClick={handleCopyPreviousBudget}
            endIcon={<SwapHorizIcon fontSize="small" />}
          >
            Copy {getPreviousMonthYear(selectedMonth)}
          </Button>

          <Button
            variant="outlined"
            color="warning"
            sx={{
              textTransform: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: 24,
              fontSize: "0.7rem",
            }}
            onClick={() => {
              setCategoryAmounts({});
              //firstTextFieldRef.current?.focus();
            }}
            endIcon={<ClearIcon fontSize="small" />}
          >
            Clear
          </Button>
        </Stack>
        {/* Budget Category List----------------------------------------------------------------------------------*/}

        <BudgetFormCategoryList
          categories={categories}
          categoryAmounts={categoryAmounts}
          firstTextFieldRef={firstTextFieldRef}
          onAmountChange={handleAmountChange}
        />
        <Divider />
        {/* Total Budget Amount ----------------------------------------------------------------------------------*/}
        <Stack direction="row" justifyContent="space-between" px={2}>
          <Typography variant="body2">Total</Typography>
          <Typography variant="body2">
            <strong>{new Intl.NumberFormat("en-US").format(totalAmount)}</strong>
          </Typography>
        </Stack>
        <EntryFormButton isLoading={isLoading} canSave={canSave} isEditMode={isEditMode} />
      </Stack>
      {SnackbarComponent}
    </>
  );
};

export default React.memo(BudgetForm);
