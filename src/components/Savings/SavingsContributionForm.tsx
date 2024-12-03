import { Add } from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";
import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { DesktopDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { ThunkDispatch } from "@reduxjs/toolkit";
import { Timestamp } from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { operation_types, txn_types } from "../../constants/collections";
import { DIALOG_CLOSEICON_SIZE, iconSizeXS } from "../../constants/size";
import { useAccountTypeContext } from "../../contextAPI/AccountTypeContext";
import { useTransactionLogsContext } from "../../contextAPI/TransactionLogsContext";
import { currentDatetoDatePicker } from "../../helper/date";
import { formatNumberWithoutCurrency, isValidInput } from "../../helper/utils";
import useSnackbarHook from "../../hooks/snackbarHook";
import AccountsIcons from "../../media/AccountsIcons";
import SavingsIcons from "../../media/SavingsIcons";
import SavingGoalsContributionModel from "../../models/SavingGoalsContribution";
import SavingGoalsModel from "../../models/SavingGoalsModel";
import TransactionLogsModel from "../../models/TransactionLogsModel";
import {
  addSavingsContributionsAction,
  deleteSavingsContributionsAction,
  updateSavingsAction,
} from "../../redux/actions/savingsAction";
import { RootState } from "../../redux/store";
import EntryFormCategoryDropdown from "../GenericComponents/EntryFormCategoryDropdown";
import SavingsContributionList from "./SavingsContributionList";

interface Props {
  EditSavings: SavingGoalsModel;
  onCloseForm: () => void;
}

const SavingsContributionForm = (props: Props) => {
  const { id: savingsIDfromURL } = useParams();
  const powerSavingMode = useSelector((state: RootState) => state.powerSaving.enabled);

  const savingsSlice : SavingGoalsModel[] = useSelector((state: RootState) => state.savings.savings);
  const savingsfromURL = savingsSlice.find((saving ) => saving.id === savingsIDfromURL);
  const initialSavings = savingsfromURL ? savingsfromURL : props.EditSavings;

  const contributions : SavingGoalsContributionModel[] = useSelector((state: RootState) => state.savingsContribution.contribution);

  const matchingContributions = contributions
    .filter((contribution ) => contribution.savingsId === initialSavings.id)
    .sort((a, b) => b.date.seconds - a.date.seconds);

  const { saveLogs } = useTransactionLogsContext();

  const dispatch = useDispatch<ThunkDispatch<any, any, any>>();
  const isFetching = useSelector((state: RootState) => state.savingsContribution.isfetching);
  const [selectedDate, setSelectedDate] = useState<Date>(currentDatetoDatePicker);
  const [goalAmount, setGoalAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const amountRef = useRef<HTMLInputElement | null>(null);
  const canSave = Boolean(Number(amountRef.current?.value) > 0);
  const [enteredAmount, setEnteredAmount] = useState<number>(0);
  const { accountType: accountTypeContext } = useAccountTypeContext();

  const [accountType, setAccountType] = useState(accountTypeContext[0].id);

  const [excessAmount, setExcessAmount] = useState(false);
  const { openSuccessSnackbar, SnackbarComponent } = useSnackbarHook();

  const [newSavings, setNewSavings] = useState<SavingGoalsModel>(initialSavings);

  useEffect(() => {
    setNewSavings(initialSavings);

    setGoalAmount((prevAmount) =>
      prevAmount > 0
        ? initialSavings.currentAmount >= prevAmount
          ? 0
          : initialSavings.targetAmount - initialSavings.currentAmount
        : initialSavings.targetAmount - initialSavings.currentAmount
    );

    //amountRef.current?.focus();
  }, [dispatch, initialSavings]);

  const handleFormSubmit = async () => {
    setLoading(true);
    if (enteredAmount > goalAmount) {
      setLoading(false);
      setExcessAmount(true);
      return;
    }
    try {
      const now = Timestamp.now();
      let newCurrentAmount = newSavings.currentAmount + enteredAmount;

      const updatedSavings = {
        ...newSavings,
        currentAmount: newCurrentAmount,
        status: newCurrentAmount >= newSavings.targetAmount ? "Completed" : "In Progress",
      };

      await dispatch(updateSavingsAction(updatedSavings));

      let newContributionId: string | undefined = "";

      const resultAction = await dispatch(
        addSavingsContributionsAction({
          id: "",
          amount: enteredAmount,
          date: Timestamp.fromDate(selectedDate),
          savingsId: newSavings.id,
          account_id: accountType,
        })
      );
      if (addSavingsContributionsAction.fulfilled.match(resultAction)) {
        newContributionId = resultAction.payload.id;
      }

      setNewSavings(updatedSavings);

      setGoalAmount((prevAmount) => (enteredAmount >= prevAmount ? 0 : prevAmount - enteredAmount));

      setEnteredAmount(0);
      const log: TransactionLogsModel = {
        txn_id: "",
        txn_ref_id: newContributionId,
        txn_type: txn_types.SavingsContribution,
        operation: operation_types.Add,
        category_id: newSavings.id, //savings has no categories
        account_id: accountType,
        amount: enteredAmount,
        lastModified: now,
      };

      await saveLogs(log);
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      console.log("Contribution Add Error", error);
    } finally {
      setLoading(false);
      setExcessAmount(false);
      if (amountRef.current) {
        amountRef.current.value = "";
      }
      //amountRef.current?.focus();
    }
    openSuccessSnackbar("Contribution has been added!");
  };

  const handleDelete = async (contribution: SavingGoalsContributionModel) => {
    setLoading(true);
    try {
      let newCurrentAmount = newSavings.currentAmount - contribution.amount;

      await dispatch(deleteSavingsContributionsAction(contribution.id));

      const updatedSavings = {
        ...newSavings,
        currentAmount: newCurrentAmount,
        status: newCurrentAmount >= newSavings.targetAmount ? "Completed" : "In Progress",
      };

      await dispatch(updateSavingsAction(updatedSavings));

      const log: TransactionLogsModel = {
        txn_id: "",
        txn_ref_id: newSavings.id,
        txn_type: txn_types.SavingsContribution,
        operation: operation_types.Delete,
        category_id: newSavings.id, //savings has no categories
        account_id: accountType,
        amount: contribution.amount,
        lastModified: Timestamp.now(),
      };

      await saveLogs(log);
      setEnteredAmount(0);
      setNewSavings(updatedSavings);
      setGoalAmount((prevAmount) => {
        return prevAmount + contribution.amount;
      });
    } catch (error) {
      console.log("Contribution Delete Error", error);
    } finally {
      setLoading(false);
      setExcessAmount(false);

      //amountRef.current?.focus();
    }

    openSuccessSnackbar("Contribution has been removed!");
  };

  const iconObject = SavingsIcons.find((icon) => icon.name === newSavings.icon);
  const color = newSavings.color;

  function renderIcon(icon: React.ReactElement, color: string) {
    return React.cloneElement(icon, { style: { color: color, fontSize: iconSizeXS } });
  }
  const handleAccountsChange = (account_id: string) => {
    setAccountType(account_id);
  };
  return (
    <>
      <Backdrop open={loading} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <Box display="flex" justifyContent="space-between" alignItems="center" py={1} px={1}>
        <Stack direction="row" alignItems="center" width="85%">
          {iconObject && renderIcon(iconObject.icon, color)}

          <Typography variant="h6" ml={0.5} noWrap>
            {newSavings.description}
          </Typography>
        </Stack>

        <CloseIcon sx={{ cursor: "pointer",fontSize:DIALOG_CLOSEICON_SIZE }} onClick={() => props.onCloseForm()}/>
      </Box>
      <Divider sx={{ mb: 2 }}>
        <Typography variant="body1">
          {"Goal: "}
          {formatNumberWithoutCurrency(goalAmount)}
        </Typography>
      </Divider>

      <Container maxWidth={false} style={{ padding: 0 }}>
        <Stack
          spacing={2}
          padding={1}
          component="form"
          sx={{}}
          onSubmit={(e) => {
            e.preventDefault();
            handleFormSubmit();
          }}
        >
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DesktopDatePicker
              label="Select a Date"
              value={selectedDate}
              onChange={(newValue) => {
                if (newValue) {
                  setSelectedDate(newValue);
                  setNewSavings({
                    ...newSavings,
                    startDate: Timestamp.fromDate(newValue),
                  });
                }
              }}
              views={["year", "month", "day"]}
              slotProps={{ textField: { size: "small" } }}
              reduceAnimations={powerSavingMode}
            />
          </LocalizationProvider>
          <TextField
            inputRef={amountRef}
            label="Amount"
            size="small"
            inputMode="numeric"
            inputProps={{ inputMode: "numeric" }}
            InputLabelProps={{ shrink: true }}
            onChange={(e) => {
              const value = e.target.value;
              if (isValidInput(value) && value.length <= 8) {
                setEnteredAmount(parseFloat(e.target.value) || 0);
              }
            }}
            onKeyDown={(e) => {
              // Allow control keys
              if (e.key.length > 1) {
                return;
              }

              const value = (e.target as HTMLInputElement).value + e.key;
              if (!isValidInput(value)) {
                e.preventDefault();
              }
            }}
            FormHelperTextProps={{ style: { color: excessAmount ? "salmon" : "#999" } }}
            helperText={excessAmount ? "Your entered amount exceeds the target savings goal" : ""}
          />
          <EntryFormCategoryDropdown
            label="Account Type"
            category_id={accountType}
            categories={accountTypeContext}
            onChange={handleAccountsChange}
            icons={AccountsIcons}
            onAddNewCategory={undefined}
          />

          <Button
            disabled={!canSave || loading || goalAmount <= 0}
            variant="outlined"
            type="submit"
            color="inherit"
            endIcon={<Add />}
          >
            {loading ? "UPDATING..." : "ADD CONTRIBUTION"}
          </Button>
        </Stack>

        <SavingsContributionList
          isFetching={isFetching}
          loading={loading}
          matchingContributions={matchingContributions}
          onDelete={handleDelete}
        />
      </Container>
      {SnackbarComponent}
    </>
  );
};

export default SavingsContributionForm;
