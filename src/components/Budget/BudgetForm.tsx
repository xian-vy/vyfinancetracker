// ExpenseForm
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ClearIcon from "@mui/icons-material/Clear";
import CloseIcon from "@mui/icons-material/Close";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import {
  Box,
  Button,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { DesktopDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { ThunkDispatch } from "@reduxjs/toolkit";
import { Timestamp } from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";
import CategoryIcons from "../../media/CategoryIcons";
import { iconSizeXS } from "../../constants/size";
import { operation_types, txn_types } from "../../constants/collections";
import { BudgetTimeframe } from "../../constants/timeframes";
import { useCategoryContext } from "../../contextAPI/CategoryContext";
import { useTransactionLogsContext } from "../../contextAPI/TransactionLogsContext";
import useSnackbarHook from "../../hooks/snackbarHook";
import { BudgetItemsModel, BudgetModel } from "../../models/BudgetModel";
import CategoryModel from "../../models/CategoryModel";
import TransactionLogsModel from "../../models/TransactionLogsModel";
import { addbudgetAction, updatebudgetAction } from "../../redux/actions/budgetAction";
import { RootState } from "../../redux/store";
import EntryFormButton from "../GenericComponents/EntryFormButton";
interface BudgetFormProps {
  onCloseForm: () => void;
}

const getPreviousMonthYear = (date: Date) => {
  const prevMonthDate = new Date(date.getFullYear(), date.getMonth() - 1, 1);
  const formattedPrevMonth = prevMonthDate.toLocaleString("default", { month: "short" });
  const formattedPrevYear = prevMonthDate.getFullYear().toString();
  return `${formattedPrevMonth} ${formattedPrevYear}`;
};

const BudgetForm: React.FC<BudgetFormProps> = ({ onCloseForm }) => {
  const { openSuccessSnackbar, SnackbarComponent } = useSnackbarHook();

  function renderIcon(icon: React.ReactElement, color: string) {
    return React.cloneElement(icon, { style: { color: color, fontSize: iconSizeXS } });
  }
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

  const copyPreviousBudget = () => {
    // Calculate the previous month and year
    const prevMonthDate = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1, 1);
    const formattedPrevMonth = prevMonthDate.toLocaleString("default", { month: "long" });
    const formattedPrevYear = prevMonthDate.getFullYear().toString();
    const prevMonthYearHeader = `${formattedPrevMonth} ${formattedPrevYear}`;

    // Find the budget for the previous month and year
    const prevBudget = budgetSlice.find((budget) => budget.monthYear === prevMonthYearHeader);
    if (prevBudget) {
      // Populate categoryAmounts with the previous budget's data
      const prevAmounts = prevBudget.budgets.reduce((acc: { [key: string]: number }, item) => {
        acc[item.category_id] = item.amount;
        return acc;
      }, {});
      setCategoryAmounts(prevAmounts);
    } else {
      openSuccessSnackbar(`Theres no budget from prev month!`, true);
    }
  };
  const handleAmountChange = (categoryId: string, value: string) => {
    if (value.length <= 8) {
      const amount = parseFloat(value.replace(/,/g, ""));
      setCategoryAmounts((prevAmounts) => ({
        ...prevAmounts,
        [categoryId]: isNaN(amount) ? 0 : amount,
      }));
    }
  };

  const [selectedMonth, setSelectedMonth] = React.useState(new Date());
  const [selectedYear, setSelectedYear] = React.useState(new Date());

  const handleDateChange = (date: Date | null) => {
    if (date !== null) {
      const newMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      setSelectedMonth(newMonth);
      setSelectedYear(new Date(date.getFullYear(), date.getMonth() + 1, 0));
      checkForExistingBudget(newMonth);
    } else {
      console.log("Invalid Month/Year");
    }
  };

  const handleMonthChange = (change: number) => {
    setSelectedMonth((current) => {
      const newMonth = new Date(current.getFullYear(), current.getMonth() + change, 1);
      setSelectedYear(new Date(newMonth.getFullYear(), newMonth.getMonth(), 1));
      checkForExistingBudget(newMonth);
      return newMonth;
    });
    // firstTextFieldRef.current?.focus();
  };

  const checkForExistingBudget = (date: Date) => {
    const formattedSelectedMonth = date.toLocaleString("default", { month: "long" });
    const formattedSelectedYear = date.getFullYear().toString();
    const monthYearHeader = `${formattedSelectedMonth} ${formattedSelectedYear}`;

    const existingBudget = budgetSlice.find((budget) => budget.monthYear === monthYearHeader);
    if (existingBudget) {
      // Populate categoryAmounts with existing data
      const amounts = existingBudget.budgets.reduce((acc: { [key: string]: number }, item) => {
        acc[item.category_id] = item.amount;
        return acc;
      }, {});
      setCategoryAmounts(amounts);
      setIsEditMode(true); // Assuming you have a state to track edit mode
    } else {
      setCategoryAmounts({});
      setIsEditMode(false);
    }
  };
  const totalAmount = Object.values(categoryAmounts).reduce((sum, amount) => sum + amount, 0);

  const canSave = typeof totalAmount === "number" && (totalAmount > 0 || isEditMode);

  useEffect(() => {
    setCategories(categoryContext);

    if (categories.length > 0 && firstTextFieldRef.current) {
      // firstTextFieldRef.current.focus();
    }
  }, [categories]);

  useEffect(() => {
    checkForExistingBudget(selectedMonth);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        handleMonthChange(-1);
      } else if (event.key === "ArrowRight") {
        handleMonthChange(1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Cleanup the event listener when the component unmounts
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleMonthChange]);

  const handleFormSubmit = async () => {
    try {
      setIsLoading(true);
      let operation: operation_types = operation_types.Create;
      const formattedSelectedMonth = selectedMonth.toLocaleString("default", { month: "long" });
      const formattedSelectedYear = selectedYear.getFullYear().toString();
      const monthYearHeader = `${formattedSelectedMonth} ${formattedSelectedYear}`;

      const budgetItems: BudgetItemsModel[] = Object.entries(categoryAmounts)
        .filter(([_, amount]) => amount > 0)
        .map(([categoryId, amount]) => ({
          id: uuidv4(),
          amount,
          category_id: categoryId,
          date: Timestamp.fromDate(new Date(selectedYear.getFullYear(), selectedMonth.getMonth(), 1)),
        }));

      if (isEditMode) {
        operation = operation_types.Update;
        const existingBudgetIndex = budgetSlice.findIndex((budget) => budget.monthYear === monthYearHeader);
        const existingBudget = budgetSlice[existingBudgetIndex];
        const updatedBudget: BudgetModel = {
          ...budgetSlice[existingBudgetIndex],
          budgets: budgetItems,
        };

        const hasAmountChanges =
          budgetItems.length !== existingBudget.budgets.length ||
          budgetItems.some((newBudgetItem) => {
            const existingBudgetItem = existingBudget.budgets.find(
              (item) => item.category_id === newBudgetItem.category_id
            );
            return !existingBudgetItem || existingBudgetItem.amount !== newBudgetItem.amount;
          });

        if (hasAmountChanges) {
          const actionResult = await dispatch(updatebudgetAction(updatedBudget));
          if (updatebudgetAction.fulfilled.match(actionResult)) {
            let logsToSave: TransactionLogsModel[] = [];
            const now = Timestamp.now();
            const newBudgetWithId = actionResult.payload;

            newBudgetWithId.budgets.forEach((budget) => {
              const log: TransactionLogsModel = {
                txn_id: uuidv4(),
                txn_ref_id: budget.id,
                txn_type: txn_types.Budget,
                operation: operation,
                category_id: budget.category_id,
                account_id: "",
                amount: budget.amount,
                lastModified: now,
              };
              logsToSave.push(log);
            });
            await saveBatchLogs(logsToSave);
          }
        } else {
          setIsLoading(false);
          openSuccessSnackbar(`Uhm., you didnt make any changes.`, true);
          return;
        }
      } else {
        operation = operation_types.Create;

        const isDuplicate = budgetSlice.some((budget) => budget.monthYear === monthYearHeader);
        if (isDuplicate) {
          openSuccessSnackbar(`A budget for ${monthYearHeader} already exists.`, true);
          setIsLoading(false);
          return;
        }

        const budgetBatch: BudgetModel = {
          budgets: budgetItems,
          monthYear: monthYearHeader,
          timeframe: BudgetTimeframe.Month,
        };
        const actionResult = await dispatch(addbudgetAction(budgetBatch));
        if (addbudgetAction.fulfilled.match(actionResult)) {
          let logsToSave: TransactionLogsModel[] = [];
          const now = Timestamp.now();

          const newBudgetWithId = actionResult.payload;

          newBudgetWithId.budgets.forEach((budget) => {
            const log: TransactionLogsModel = {
              txn_id: uuidv4(),
              txn_ref_id: budget.id,
              txn_type: txn_types.Budget,
              operation: operation,
              category_id: budget.category_id,
              account_id: "",
              amount: budget.amount,
              lastModified: now,
            };
            logsToSave.push(log);
          });
          await saveBatchLogs(logsToSave);
          setIsEditMode(true);
        }
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
      // firstTextFieldRef.current?.focus();
      setIsLoading(false);
      openSuccessSnackbar(`Budget has been ${isEditMode ? "Updated" : "Added"}`);
    } catch (error) {
      console.error("Error submitting budgets:", error);
    }
  };

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
            onClick={copyPreviousBudget}
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
              firstTextFieldRef.current?.focus();
            }}
            endIcon={<ClearIcon fontSize="small" />}
          >
            Clear
          </Button>
        </Stack>

        <List dense sx={{ height: { xs: 200, md: 150, lg: 180, xl: 250 }, overflowY: "auto" }}>
          {categories.map((category, index) => {
            const categoryIcon = CategoryIcons.find((icon) => icon.name === category?.icon);

            return (
              <ListItem key={category.id} value={category.id}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ width: "100%" }}>
                  <ListItemAvatar>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      {categoryIcon && renderIcon(categoryIcon.icon, category.color)}
                      <Typography align="left" variant="body1" pl={1} noWrap>
                        {category.description}
                      </Typography>
                    </div>
                  </ListItemAvatar>
                  <TextField
                    inputRef={index === 0 ? firstTextFieldRef : null}
                    value={new Intl.NumberFormat("en-US").format(categoryAmounts[category.id] || 0)}
                    onChange={(e) => handleAmountChange(category.id, e.target.value)}
                    size="small"
                    sx={{ width: 60, ml: 2 }}
                    variant="standard"
                    inputMode="numeric"
                    inputProps={{ inputMode: "numeric" }}
                  />
                </Stack>
              </ListItem>
            );
          })}
        </List>
        <Divider />

        <Stack direction="row" justifyContent="space-between" px={2}>
          <Typography variant="body2">Total</Typography>
          <Typography variant="body2">
            <strong>{new Intl.NumberFormat("en-US").format(totalAmount)}</strong>
          </Typography>
        </Stack>

        <EntryFormButton isLoading={isLoading} canSave={canSave} isEditMode={isEditMode} />

        {SnackbarComponent}
      </Stack>
    </>
  );
};

export default React.memo(BudgetForm);
