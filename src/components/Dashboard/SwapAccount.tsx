import { CloseOutlined } from "@mui/icons-material";
import EastIcon from "@mui/icons-material/East";
import { Button, Dialog, DialogContent, DialogTitle, IconButton, TextField, Typography } from "@mui/material";
import Stack from "@mui/material/Stack";
import { ThunkDispatch } from "@reduxjs/toolkit";
import { Timestamp } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { txn_types } from "../../constants/collections";
import { iconSizeXS } from "../../constants/size";
import { useAccountTypeContext } from "../../contextAPI/AccountTypeContext";
import { useTransactionLogsContext } from "../../contextAPI/TransactionLogsContext";
import { getAccountsDetails } from "../../firebase/utils";
import { createSwapLog } from "../../helper/utils";
import AccountsIcons from "../../media/AccountsIcons";
import ExpenseModel from "../../models/ExpenseModel";
import IncomeModel from "../../models/IncomeModel";
import { addExpenseAction } from "../../redux/actions/expenseAction";
import { addincomeAction } from "../../redux/actions/incomeAction";
import { RootState } from "../../redux/store";
import EntryFormCategoryDropdown from "../GenericComponents/EntryFormCategoryDropdown";
import useSnackbarHook from "../../hooks/snackbarHook";
import { useCategoryContext } from "../../contextAPI/CategoryContext";
import { useIncomeSourcesContext } from "../../contextAPI/IncomeSourcesContext";
function renderIcon(icon: React.ReactElement, color: string) {
  return React.cloneElement(icon, { style: { color: color, fontSize: iconSizeXS } });
}

interface Props {
  openDialog: boolean;
  onDialogClose: () => void;
}
const SwapAccount = (props: Props) => {
  const powerSavingMode = useSelector((state: RootState) => state.powerSaving.enabled);
  const isDarkMode = useSelector((state: RootState) => state.theme.darkMode);
  const { accountType, loading: loadingAccounts } = useAccountTypeContext();
  const { categories, loading: loadingCategories } = useCategoryContext();
  const { incomeSource, loading: loadingIncomeSource } = useIncomeSourcesContext();

  const { saveLogs } = useTransactionLogsContext();
  const { openSuccessSnackbar, SnackbarComponent } = useSnackbarHook();
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch<ThunkDispatch<any, any, any>>();
  const [expense, setExpense] = useState<ExpenseModel>({
    id: "",
    description: "Swap account",
    amount: 0,
    account_id: accountType[0]?.id,
    date: Timestamp.now(),
    category_id: "",
  });
  const [expenseFee, setExpenseFee] = useState<ExpenseModel>({
    id: "",
    description: "Swap fee",
    amount: 0,
    account_id: accountType[0]?.id,
    date: Timestamp.now(),
    category_id: "",
  });
  const [income, setIncome] = useState<IncomeModel>({
    id: "",
    description: "Swap account",
    amount: 0,
    category_id: "",
    date: Timestamp.now(),
    account_id: accountType[1]?.id,
  });

  const isCategoriesLoading = loadingAccounts && loadingCategories && loadingIncomeSource;

  useEffect(() => {
    if (!isCategoriesLoading) {
      //find default category for Swap Account
      const swapAccountCategory = categories.find((category) => {
        return category.description === "Swap Account";
      })?.id;
      const swapAccountIncomeSource = incomeSource.find((category) => {
        return category.description === "Swap Account";
      })?.id;
      const category_id = swapAccountCategory || "";
      const income_source = swapAccountIncomeSource || "";
      setExpense((prevExpense) => ({ ...prevExpense, account_id: accountType[0]?.id, category_id }));
      setExpenseFee((prevExpense) => ({ ...prevExpense, account_id: accountType[0]?.id, category_id }));
      setIncome((prevIncome) => ({ ...prevIncome, account_id: accountType[1]?.id, category_id: income_source }));
    }
  }, [accountType, categories, incomeSource, isCategoriesLoading]);

  const sourceAccount = getAccountsDetails(accountType, expense.account_id);
  const destinationAccount = getAccountsDetails(accountType, income.account_id);
  const sourceIcon = AccountsIcons.find((icon) => icon.name === sourceAccount.categoryIcon?.name);
  const destinationIcon = AccountsIcons.find((icon) => icon.name === destinationAccount.categoryIcon?.name);

  const handleSourceAccountChange = (account_id: string) => {
    setExpense((prevExpense) => ({ ...prevExpense, account_id }));
  };
  const handleFeeAccountChange = (account_id: string) => {
    setExpenseFee((prevExpense) => ({ ...prevExpense, account_id }));
  };
  const handleDestinationAccountChange = (account_id: string) => {
    setIncome((prevIncome) => ({ ...prevIncome, account_id }));
  };

  const handleSwapAmount = async () => {
    if (expense.account_id === income.account_id) {
      openSuccessSnackbar("Cannot swap same Accounts.", true);
      return;
    }
    setLoading(true);
    const incomeId = await dispatch(addincomeAction(income)).then((action) => action.payload);
    const expenseId = await dispatch(addExpenseAction(expense)).then((action) => action.payload);

    const incomeLog = createSwapLog(
      incomeId as string,
      txn_types.Income,
      income.category_id,
      income.account_id,
      income.amount
    );
    const expenseLog = createSwapLog(
      expenseId as string,
      txn_types.Expenses,
      expense.category_id,
      expense.account_id,
      expense.amount
    );

    await saveLogs(incomeLog);
    await saveLogs(expenseLog);

    if (expenseFee.amount > 0) {
      const expenseFeeId = await dispatch(addExpenseAction(expenseFee)).then((action) => action.payload);
      const expenseFeeLog = createSwapLog(
        expenseFeeId as string,
        txn_types.Expenses,
        expenseFee.category_id,
        expenseFee.account_id,
        expenseFee.amount
      );
      await saveLogs(expenseFeeLog);
    }

    setLoading(false);
    openSuccessSnackbar("Amount swapped successfully!");
    props.onDialogClose();
  };

  return (
    <div>
      <Dialog
        open={props.openDialog}
        PaperProps={{
          sx: { borderRadius: 1, background: isDarkMode ? "#1e1e1e" : "#fff", maxWidth: { xs: "auto", sm: 400 } },
        }}
        fullWidth
        transitionDuration={powerSavingMode ? 0 : undefined}
      >
        <DialogTitle
          sx={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}
        >
          <Typography variant="body1">Swap Accounts</Typography>
          <IconButton size="small" onClick={() => props.onDialogClose()} sx={{ mr: -1 }}>
            <CloseOutlined />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ px: { xs: 1, sm: 2 } }}>
          <Stack direction="column" justifyContent="center" alignItems="center" spacing={{ xs: 2, sm: 3 }} p={1}>
            <Stack direction="row" justifyContent="center" alignItems="center" spacing={1}>
              <Stack direction="row" justifyContent="center" alignItems="center">
                {sourceIcon && renderIcon(sourceIcon.icon, sourceAccount.color || "#ccc")}
                <Typography variant="caption" ml={0.3}>
                  {sourceAccount.description}
                </Typography>
              </Stack>
              <EastIcon sx={{ fontSize: 14 }} />
              <Stack direction="row" justifyContent="center" alignItems="center">
                {destinationIcon && renderIcon(destinationIcon.icon, destinationAccount.color || "#ccc")}
                <Typography variant="caption" ml={0.3}>
                  {destinationAccount.description}
                </Typography>
              </Stack>
            </Stack>
            <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1} width="100%">
              <EntryFormCategoryDropdown
                increaseLabel
                label="Source Account"
                category_id={expense.account_id}
                categories={accountType}
                onChange={handleSourceAccountChange}
                icons={AccountsIcons}
              />

              <EntryFormCategoryDropdown
                increaseLabel
                label="Destination Account"
                category_id={income.account_id}
                categories={accountType}
                onChange={handleDestinationAccountChange}
                icons={AccountsIcons}
              />
            </Stack>
            <TextField
              fullWidth
              inputMode="numeric"
              inputProps={{ inputMode: "numeric" }}
              size="small"
              label="Amount"
              value={new Intl.NumberFormat("en-US").format(income.amount)}
              onChange={(e) => {
                const value = e.target.value;
                const amount = parseFloat(value.replace(/,/g, ""));
                if (value.length <= 8) {
                  setIncome((prevIncome) => ({ ...prevIncome, amount: isNaN(amount) ? 0 : amount }));
                  setExpense((prevExpense) => ({ ...prevExpense, amount: isNaN(amount) ? 0 : amount }));
                }
              }}
              InputLabelProps={{ shrink: true, sx: { fontSize: 15 } }}
            />

            <TextField
              fullWidth
              size="small"
              label="Description"
              value={expense.description}
              onChange={(e) => {
                if (e.target.value.length <= 40) {
                  setExpense({
                    ...expense,
                    description: e.target.value,
                  });
                  setIncome({
                    ...income,
                    description: e.target.value,
                  });
                  setExpenseFee({
                    ...expenseFee,
                    description: e.target.value,
                  });
                }
              }}
              InputLabelProps={{ shrink: true, sx: { fontSize: 15 } }}
            />

            <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1} width="100%">
              <TextField
                fullWidth
                inputMode="numeric"
                inputProps={{ inputMode: "numeric" }}
                size="small"
                label="Fee"
                value={new Intl.NumberFormat("en-US").format(expenseFee.amount)}
                onChange={(e) => {
                  const value = e.target.value;
                  const amount = parseFloat(value.replace(/,/g, ""));
                  if (value.length <= 8) {
                    setExpenseFee((prevExpenseFee) => ({ ...prevExpenseFee, amount: isNaN(amount) ? 0 : amount }));
                  }
                }}
                InputLabelProps={{ shrink: true, sx: { fontSize: 15 } }}
              />

              <EntryFormCategoryDropdown
                increaseLabel
                label="Fee Account"
                category_id={expenseFee.account_id}
                categories={accountType}
                onChange={handleFeeAccountChange}
                icons={AccountsIcons}
              />
            </Stack>

            <Button
              disabled={loading || expense.amount <= 0}
              fullWidth
              color="inherit"
              variant="outlined"
              onClick={handleSwapAmount}
            >
              Swap Amount
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>
      {SnackbarComponent}
    </div>
  );
};

export default SwapAccount;
