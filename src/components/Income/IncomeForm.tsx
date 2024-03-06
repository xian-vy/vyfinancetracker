// ExpenseForm
import CloseIcon from "@mui/icons-material/Close";
import { Box, Dialog, DialogContent, IconButton, Stack, TextField, Typography } from "@mui/material";
import { ThunkDispatch } from "@reduxjs/toolkit";
import { Timestamp } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { operation_types, txn_types } from "../../constants/collections";
import { useAccountTypeContext } from "../../contextAPI/AccountTypeContext";
import { useIncomeSourcesContext } from "../../contextAPI/IncomeSourcesContext";
import { useTransactionLogsContext } from "../../contextAPI/TransactionLogsContext";
import { currentDatetoDatePicker } from "../../helper/date";
import AccountsIcons from "../../media/AccountsIcons";
import IncomeSourceIcons from "../../media/IncomeSourceIcons";
import AccountTypeModel from "../../models/AccountTypeModel";
import IncomeModel from "../../models/IncomeModel";
import IncomeSourcesModel from "../../models/IncomeSourcesModel";
import TransactionLogsModel from "../../models/TransactionLogsModel";
import { addincomeAction, updateincomeAction } from "../../redux/actions/incomeAction";
import EntryFormButton from "../GenericComponents/EntryFormButton";
import EntryFormCategoryDropdown from "../GenericComponents/EntryFormCategoryDropdown";
import EntryFormDatePicker from "../GenericComponents/EntryFormDatePicker";

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

  const canSave = newIncome.amount > 0;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        if (isEditMode) {
          const dateFromTimestamp = editIncome.date.toDate();

          setSelectedDate(dateFromTimestamp);
          setIncome(editIncome);
        } else {
          setIncome((prevIncome) => ({
            ...prevIncome,
            category_id: categoryIdFromUrl || incomeSource[0].id,
            account_id: accountType[0].id,
          }));
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

      if (isEditMode) {
        await dispatch(updateincomeAction(newIncome));
        incomeId = newIncome.id;
      } else {
        const resultAction = await dispatch(addincomeAction(newIncome));
        if (addincomeAction.fulfilled.match(resultAction)) {
          incomeId = resultAction.payload.id;
        }
      }

      if (!isEditMode || (isEditMode && editIncome.amount !== newIncome.amount)) {
        const log: TransactionLogsModel = {
          txn_id: "",
          txn_ref_id: incomeId,
          txn_type: txn_types.Income,
          operation: isEditMode ? operation_types.Update : operation_types.Create,
          category_id: newIncome.category_id,
          account_id: newIncome.account_id,
          amount: newIncome.amount,
          lastModified: Timestamp.now(),
        };

        await saveLogs(log);
      }

      await new Promise((resolve) => setTimeout(resolve, 500));
      onUpdate(isEditMode ? operation_types.Update : operation_types.Create);
    } catch (error) {
      console.error("Error saving income", error);
    } finally {
      setIncome({ ...newIncome, amount: 0, id: "", description: "" });
      setIsLoading(false);
    }
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
        spacing={2}
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

        <TextField
          required
          inputMode="numeric"
          inputProps={{ inputMode: "numeric" }}
          size="small"
          label="Amount"
          value={new Intl.NumberFormat("en-US").format(newIncome.amount)}
          onChange={(e) => {
            const value = e.target.value;
            const amount = parseFloat(value.replace(/,/g, ""));
            if (value.length <= 8) {
              setIncome({
                ...newIncome,
                amount: isNaN(amount) ? 0 : amount,
              });
            }
          }}
          InputLabelProps={{ shrink: true }}
        />

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
