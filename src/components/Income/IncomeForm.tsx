// ExpenseForm.tsx
import CloseIcon from "@mui/icons-material/Close";
import { Box, Dialog, DialogContent, IconButton, Stack, TextField, Typography } from "@mui/material";
import { ThunkDispatch } from "@reduxjs/toolkit";
import { Timestamp } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { currentDatetoDatePicker } from "../../Helper/date";
import { isValidInput } from "../../Helper/utils";
import AccountsIcons from "../../Media/AccountsIcons";
import IncomeSourceIcons from "../../Media/IncomeSourceIcons";
import { operation_types, txn_types } from "../../constants/collections";
import { useAccountTypeContext } from "../../contextAPI/AccountTypeContext";
import { useIncomeSourcesContext } from "../../contextAPI/IncomeSourcesContext";
import { useTransactionLogsContext } from "../../contextAPI/TransactionLogsContext";
import AccountTypeModel from "../../models/AccountTypeModel";
import IncomeModel from "../../models/IncomeModel";
import IncomeSourcesModel from "../../models/IncomeSourcesModel";
import TransactionLogsModel from "../../models/TransactionLogsModel";
import { addincomeAction, updateincomeAction } from "../../redux/actions/incomeAction";
import EntryFormCategoryDropdown from "../GenericComponents/EntryFormCategoryDropdown";
import EntryFormButton from "../GenericComponents/EntryFormButton";
import EntryFormDatePicker from "../GenericComponents/EntryFormDatePicker";
import NumericKeypad from "../NumericKeypad";

interface IncomeFormProps {
  editIncome: IncomeModel;
  onCloseForm: () => void;
  onUpdate: (operation: string) => void;
  isEditMode: boolean;
}

const AccountsForm = React.lazy(() => import("../Maintenance/Accounts/AccountsForm"));
const IncomeSourceForm = React.lazy(() => import("../Maintenance/IncomeSource/IncomeSourceForm"));

const IncomeForm: React.FC<IncomeFormProps> = ({ editIncome, onCloseForm, isEditMode, onUpdate }) => {
  const { id: categoryIdFromUrl } = useParams();

  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(currentDatetoDatePicker);
  const [amountInput, setAmountInput] = useState<string>("");
  const [accountFormOpen, setAccountFormOpen] = useState(false);
  const [incomeSourceFormOpen, setIncomeSourceFormOpen] = useState(false);

  const dispatch = useDispatch<ThunkDispatch<any, any, any>>();
  const { accountType } = useAccountTypeContext();
  const { incomeSource } = useIncomeSourcesContext();

  const { saveLogs } = useTransactionLogsContext();

  const [newIncome, setIncome] = useState<IncomeModel>({
    id: "",
    amount: 0,
    category_id: categoryIdFromUrl || "",
    date: Timestamp.now(),
    description: "",
    account_id: "",
  });

  const canSave = parseFloat(amountInput) > 0 && isValidInput(amountInput);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        if (isEditMode) {
          const dateFromTimestamp = editIncome.date.toDate();

          setSelectedDate(dateFromTimestamp);
          setIncome(editIncome);
          setAmountInput(editIncome.amount.toString());
        } else {
          setIncome((prevIncome) => ({
            ...prevIncome,
            category_id: categoryIdFromUrl || incomeSource[0].id,
            account_id: accountType[0].id,
          }));
          setAmountInput("");
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const handleFormSubmit = async () => {
    try {
      setIsLoading(true);

      let incomeId: string | undefined = "";
      const parsedAmount = parseFloat(amountInput);

      const updatedIncome = {
        ...newIncome,
        amount: parsedAmount,
      };

      if (isEditMode) {
        await dispatch(updateincomeAction(updatedIncome));
        incomeId = updatedIncome.id;
      } else {
        const resultAction = await dispatch(addincomeAction(updatedIncome));
        if (addincomeAction.fulfilled.match(resultAction)) {
          incomeId = resultAction.payload.id;
        }
      }

      if (!isEditMode || (isEditMode && editIncome.amount !== updatedIncome.amount)) {
        const log: TransactionLogsModel = {
          txn_id: "",
          txn_ref_id: incomeId,
          txn_type: txn_types.Income,
          operation: isEditMode ? operation_types.Update : operation_types.Create,
          category_id: updatedIncome.category_id,
          account_id: updatedIncome.account_id,
          amount: updatedIncome.amount,
          lastModified: Timestamp.now(),
        };

        await saveLogs(log);
      }

      await new Promise((resolve) => setTimeout(resolve, 500));
      onUpdate(isEditMode ? operation_types.Update : operation_types.Create);
    } catch (error) {
      console.error("Error saving income", error);
    } finally {
      setAmountInput("0");
      setIncome({ ...newIncome, amount: 0, id: "", description: "" });
      //setSelectedDate(currentDatetoDatePicker);
      setIsLoading(false);
    }
  };

  const handleCalculatorInput = (input: string) => {
    setAmountInput((prevInput) => {
      const newAmount = prevInput + input;

      if (isValidInput(newAmount) && newAmount.length <= 8) {
        return newAmount;
      } else {
        return prevInput;
      }
    });
  };
  const handleClearInput = () => {
    setIncome((prevIncome) => ({
      ...prevIncome,
      amount: 0,
    }));
    setAmountInput("");
  };
  const handleCategoryChange = (category_id: string) => {
    setIncome((prevIncome) => ({
      ...prevIncome,
      category_id,
    }));
  };
  const handleAccountsChange = (account_id: string) => {
    setIncome((prevIncome) => ({
      ...prevIncome,
      account_id,
    }));
  };
  return (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6"> Income Entry Form</Typography>
        <IconButton onClick={() => onCloseForm()} sx={{ mr: -1.5 }}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Stack
        spacing={1.5}
        padding={1.5}
        component="form"
        onSubmit={(e) => {
          e.preventDefault();
          handleFormSubmit();
        }}
      >
        <EntryFormDatePicker
          selectedDate={selectedDate}
          setSelectedDate={() => setSelectedDate}
          newData={newIncome}
          setNewData={setIncome}
        />

        <Stack direction="row" justifyContent="center" alignItems="center" spacing={0.5}>
          <EntryFormCategoryDropdown
            label="Income Source"
            category_id={newIncome.category_id || ""}
            categories={incomeSource}
            onChange={handleCategoryChange}
            icons={IncomeSourceIcons}
            onAddNewCategory={() => setIncomeSourceFormOpen(true)}
          />
          <EntryFormCategoryDropdown
            label="Account Type"
            category_id={newIncome.account_id || ""}
            categories={accountType}
            onChange={handleAccountsChange}
            icons={AccountsIcons}
            onAddNewCategory={() => setAccountFormOpen(true)}
          />
        </Stack>
        <TextField
          size="small"
          label="Description"
          value={newIncome.description}
          onChange={(e) => {
            if (e.target.value.length <= 70) {
              setIncome({
                ...newIncome,
                description: e.target.value,
              });
            }
          }}
          InputLabelProps={{ shrink: true }}
        />

        <Typography textAlign="center" sx={{ fontSize: "0.9rem", m: 0 }}>
          {new Intl.NumberFormat("en-US", { maximumSignificantDigits: 7 }).format(Number(amountInput)) || "0.00"}
        </Typography>

        <NumericKeypad onInput={handleCalculatorInput} disabled={isLoading} onClear={handleClearInput} />

        <EntryFormButton isLoading={isLoading} canSave={canSave} isEditMode={isEditMode} />
      </Stack>
      <Dialog
        open={accountFormOpen}
        PaperProps={{
          sx: { borderRadius: 4 },
        }}
      >
        <React.Suspense fallback={<div>loading...</div>}>
          <DialogContent sx={{ px: 2, py: 1 }}>
            <AccountsForm
              closeForm={() => setAccountFormOpen(false)}
              editAccountType={{} as AccountTypeModel}
              isEditMode={false}
              onSave={(data) => {
                setAccountFormOpen(false);
                setIncome((currentExpense) => ({
                  ...currentExpense,
                  account_id: data.newAccount,
                }));
              }}
            />
          </DialogContent>
        </React.Suspense>
      </Dialog>
      <Dialog
        open={incomeSourceFormOpen}
        PaperProps={{
          sx: { borderRadius: 4 },
        }}
      >
        <React.Suspense fallback={<div>loading...</div>}>
          <DialogContent sx={{ px: 2, py: 1 }}>
            <IncomeSourceForm
              closeForm={() => setIncomeSourceFormOpen(false)}
              editIncomeSource={{} as IncomeSourcesModel}
              isEditMode={false}
              onSave={(data) => {
                setIncomeSourceFormOpen(false);
                setIncome((currentExpense) => ({
                  ...currentExpense,
                  category_id: data.newIncomeSource,
                }));
              }}
            />
          </DialogContent>
        </React.Suspense>
      </Dialog>
    </>
  );
};

export default IncomeForm;
