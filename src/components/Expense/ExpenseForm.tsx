// ExpenseForm
import CloseIcon from "@mui/icons-material/Close";
import { Box, Dialog, DialogContent, IconButton, Stack, TextField, Typography } from "@mui/material";
import { ThunkDispatch } from "@reduxjs/toolkit";
import { Timestamp } from "firebase/firestore"; // Import Firestore
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { operation_types, txn_types } from "../../constants/collections";
import { useTransactionLogsContext } from "../../contextAPI/TransactionLogsContext";
import { currentDatetoDatePicker } from "../../helper/date";
import { isValidInput } from "../../helper/utils";
import AccountsIcons from "../../media/AccountsIcons";
import CategoryIcons from "../../media/CategoryIcons";
import AccountTypeModel from "../../models/AccountTypeModel";
import CategoryModel from "../../models/CategoryModel";
import ExpenseModel from "../../models/ExpenseModel";
import TransactionLogsModel from "../../models/TransactionLogsModel";
import { addExpenseAction, updateExpenseAction } from "../../redux/actions/expenseAction";
import { RootState } from "../../redux/store";
import EntryFormAutoCompleteInput from "../GenericComponents/EntryFormAutoCompleteInput";
import EntryFormButton from "../GenericComponents/EntryFormButton";
import EntryFormCategoryDropdown from "../GenericComponents/EntryFormCategoryDropdown";
import EntryFormDatePicker from "../GenericComponents/EntryFormDatePicker";

const CategoryForm = React.lazy(() => import("../Maintenance/Category/CategoryForm"));
const AccountsForm = React.lazy(() => import("../Maintenance/Accounts/AccountsForm"));

interface ExpenseFormProps {
  onUpdateExpense: () => void;
  editExpense: ExpenseModel;
  onCloseForm: () => void;
  isEditMode: boolean;
  accountType: AccountTypeModel[];
  categoryContext: CategoryModel[];
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({
  onUpdateExpense,
  editExpense,
  isEditMode,
  onCloseForm,
  accountType,
  categoryContext,
}) => {
  const { id: categoryIdFromUrl } = useParams();
  const [selectedDate, setSelectedDate] = useState<Date>(currentDatetoDatePicker);
  const [categoryFormOpen, setCategoryFormOpen] = useState(false);
  const [accountFormOpen, setAccountFormOpen] = useState(false);
  const expenses = useSelector((state: RootState) => state.expenses.expenses);
  const uniqueDescriptions = useMemo<string[]>(() => {
    const descriptionsSet = new Set<string>();
    expenses.forEach((expense) => descriptionsSet.add(expense.description));
    return Array.from(descriptionsSet);
  }, [expenses]);

  const [newExpense, setNewExpense] = useState<ExpenseModel>({
    id: "",
    description: "",
    amount: 0,
    account_id: "",
    date: Timestamp.now(),
    category_id: categoryIdFromUrl || "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const { saveLogs } = useTransactionLogsContext();
  const dispatch = useDispatch<ThunkDispatch<any, any, any>>();

  const descriptionRef = useRef<HTMLInputElement | null>(null);

  const canSave = newExpense.amount > 0;

  useEffect(() => {
    if (isEditMode) {
      try {
        const dateFromTimestamp = editExpense.date.toDate();
        setSelectedDate(dateFromTimestamp);
        setNewExpense(editExpense);
      } catch (error) {
        console.error("isEditMode", error);
      }
    } else {
      setNewExpense((prevExpense) => ({
        ...prevExpense,
        category_id: categoryIdFromUrl || categoryContext[0]?.id,
        account_id: accountType[0]?.id,
      }));
    }
    //descriptionRef.current?.focus();
  }, [editExpense]);

  const handleFormSubmit = async () => {
    try {
      setIsLoading(true);

      let expenseId: string | undefined = "";

      if (isEditMode) {
        await dispatch(updateExpenseAction(newExpense));
        expenseId = newExpense.id;
      } else {
        const resultAction = await dispatch(addExpenseAction(newExpense));
        if (addExpenseAction.fulfilled.match(resultAction)) {
          expenseId = resultAction.payload.id;
        }
      }

      if (!isEditMode || (isEditMode && editExpense.amount !== newExpense.amount)) {
        const log: TransactionLogsModel = {
          txn_id: "",
          txn_ref_id: expenseId,
          txn_type: txn_types.Expenses,
          operation: isEditMode ? operation_types.Update : operation_types.Create,
          category_id: newExpense.category_id,
          account_id: newExpense.account_id,
          amount: newExpense.amount,
          lastModified: Timestamp.now(),
        };

        await saveLogs(log);
      }

      await new Promise((resolve) => setTimeout(resolve, 500));

      onUpdateExpense();
    } catch (error) {
      console.error("Error saving expense:", error);
    } finally {
      setNewExpense({
        ...newExpense,
        description: "",
        id: "",
        amount: 0,
      });

      //descriptionRef.current?.focus();
      setIsLoading(false);
    }
  };

  const handleCategoryChange = (category_id: string) => {
    setNewExpense((prevExpense) => ({
      ...prevExpense,
      category_id,
    }));
  };
  const handleAccountsChange = (account_id: string) => {
    setNewExpense((prevExpense) => ({
      ...prevExpense,
      account_id,
    }));
  };
  return (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6"> Expense Entry Form</Typography>
        <IconButton onClick={() => onCloseForm()} sx={{ mr: -1.5 }}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Stack
        component="form"
        spacing={1.5}
        padding={1.5}
        onSubmit={(e) => {
          e.preventDefault();
          handleFormSubmit();
        }}
      >
        <EntryFormDatePicker
          selectedDate={selectedDate}
          setSelectedDate={() => setSelectedDate}
          newData={newExpense}
          setNewData={setNewExpense}
        />

        <EntryFormAutoCompleteInput
          options={
            newExpense.description.trim().length > 0
              ? uniqueDescriptions.filter((option) => option.includes(newExpense.description))
              : []
          }
          value={newExpense.description}
          onInputChange={(event, newInputValue) => {
            setNewExpense({ ...newExpense, description: newInputValue });
          }}
          onChange={(e) => {
            if (e.target.value.length <= 70) {
              setNewExpense({ ...newExpense, description: e.target.value });
            }
          }}
          inputRef={descriptionRef}
        />

        <TextField
          required
          inputMode="numeric"
          inputProps={{ inputMode: "numeric" }}
          size="small"
          label="Amount"
          value={newExpense.amount}
          onChange={(e) => {
            const value = e.target.value;
            if (isValidInput(value) && value.length <= 8) {
              setNewExpense({
                ...newExpense,
                amount: parseFloat(value) || 0,
              });
            }
          }}
          InputLabelProps={{ shrink: true }}
        />

        <Stack direction="row" justifyContent="center" alignItems="center" spacing={0.5}>
          <EntryFormCategoryDropdown
            label="Category"
            category_id={newExpense.category_id || ""}
            categories={categoryContext}
            onChange={handleCategoryChange}
            icons={CategoryIcons}
            onAddNewCategory={() => setCategoryFormOpen(true)}
          />
          <EntryFormCategoryDropdown
            label="Account Type"
            category_id={newExpense.account_id || ""}
            categories={accountType}
            onChange={handleAccountsChange}
            icons={AccountsIcons}
            onAddNewCategory={() => setAccountFormOpen(true)}
          />
        </Stack>

        <EntryFormButton isLoading={isLoading} canSave={canSave} isEditMode={isEditMode} />
      </Stack>
      <Dialog
        open={categoryFormOpen}
        PaperProps={{
          sx: { borderRadius: 4 },
        }}
      >
        <DialogContent sx={{ px: 2, py: 1 }}>
          <React.Suspense fallback={<div>loading...</div>}>
            <CategoryForm
              categoryContext={categoryContext}
              closeForm={() => setCategoryFormOpen(false)}
              editCategory={{} as CategoryModel}
              isEditMode={false}
              onSave={(data) => {
                setCategoryFormOpen(false);
                setNewExpense((currentExpense) => ({
                  ...currentExpense,
                  category_id: data.newCategory,
                }));
              }}
            />
          </React.Suspense>
        </DialogContent>
      </Dialog>

      <Dialog
        open={accountFormOpen}
        PaperProps={{
          sx: { borderRadius: 4 },
        }}
      >
        <DialogContent sx={{ px: 2, py: 1 }}>
          <React.Suspense fallback={<div>loading...</div>}>
            <AccountsForm
              closeForm={() => setAccountFormOpen(false)}
              editAccountType={{} as AccountTypeModel}
              isEditMode={false}
              onSave={(data) => {
                setAccountFormOpen(false);
                setNewExpense((currentExpense) => ({
                  ...currentExpense,
                  account_id: data.newAccount,
                }));
              }}
            />
          </React.Suspense>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ExpenseForm;
