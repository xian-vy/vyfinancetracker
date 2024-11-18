import { Add as AddIcon } from "@mui/icons-material";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import { Backdrop, CircularProgress, Dialog, DialogContent, Grid, Paper, Typography, useTheme } from "@mui/material";
import { ThunkDispatch } from "@reduxjs/toolkit";
import React, { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ACTION_TYPES } from "../../../constants/constants";
import { FORM_WIDTH, iconSizeXS } from "../../../constants/size";
import { useAccountTypeContext } from "../../../contextAPI/AccountTypeContext";
import { ThemeColor } from "../../../helper/utils";
import { useActionPopover } from "../../../hooks/actionHook";
import useSnackbarHook from "../../../hooks/snackbarHook";
import AccountsIcons from "../../../media/AccountsIcons";
import AccountTypeModel from "../../../models/AccountTypeModel";
import { updateExpenseAction } from "../../../redux/actions/expenseAction";
import { updateincomeAction } from "../../../redux/actions/incomeAction";
import { updateSavingsContributionAction } from "../../../redux/actions/savingsAction";
import { RootState } from "../../../redux/store";
import CustomIconButton from "../../CustomIconButton";
import DeleteConfirmationDialog from "../../Dialog/DeleteConfirmationDialog";
import EntryFormSkeleton from "../../Skeleton/EntryFormSkeleton";
import GenericListItem from "../GenericListItem";
import ExpenseModel from "../../../models/ExpenseModel";
import SavingGoalsContributionModel from "../../../models/SavingGoalsContribution";
import IncomeModel from "../../../models/IncomeModel";
const AccountsForm = React.lazy(() => import("./AccountsForm"));

const AccountsList = () => {
  const { accountType, deleteAccountType } = useAccountTypeContext();
  const [isFormOpen, setFormOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [deleteFormOpen, setDeleteFormOpen] = useState(false);
  const dispatch = useDispatch<ThunkDispatch<any, any, any>>();
  const expenses : ExpenseModel[] = useSelector((state: RootState) => state.expenses.expenses);
  const savingsContributions : SavingGoalsContributionModel[] = useSelector((state: RootState) => state.savingsContribution.contribution);
  const income : IncomeModel[]= useSelector((state: RootState) => state.income.income);
  const [isLoading, setIsLoading] = useState(false);
  const [editAccountType, seteditAccountType] = useState<AccountTypeModel>({} as AccountTypeModel);

  const handleAddAccountType = () => {
    setEditMode(false);
    setFormOpen(true);
  };

  const handleDeleteAccountType = useCallback(async () => {
    try {
      setIsLoading(true);
      const ExpensesWithSameAccount = expenses.filter((expense) => {
        return expense.account_id === editAccountType.id;
      });

      const IncomeWithSameAccount = income.filter((income) => {
        return income.account_id === editAccountType.id;
      });

      const SavingsContributionWithSameAccount = savingsContributions.filter((savings) => {
        return savings.account_id === editAccountType.id;
      });

      const uncategorized = accountType.find((ptype) => {
        return ptype.description === "Uncategorized";
      });

      const uncategorizedId = uncategorized ? uncategorized.id : "";

      if (ExpensesWithSameAccount.length > 0) {
        await Promise.all(
          ExpensesWithSameAccount.map((expense) =>
            dispatch(updateExpenseAction({ ...expense, account_id: uncategorizedId }))
          )
        );
      }

      if (IncomeWithSameAccount.length > 0) {
        await Promise.all(
          IncomeWithSameAccount.map((income) =>
            dispatch(updateincomeAction({ ...income, account_id: uncategorizedId }))
          )
        );
      }
      if (SavingsContributionWithSameAccount.length > 0) {
        await Promise.all(
          SavingsContributionWithSameAccount.map((savings) =>
            dispatch(updateSavingsContributionAction({ ...savings, account_id: uncategorizedId }))
          )
        );
      }

      deleteAccountType(editAccountType.id);

      openSuccessSnackbar(`Account has been deleted`);
    } catch (error) {
      console.log("Delete category failed", error);
    } finally {
      setDeleteFormOpen(false);
      setIsLoading(false);
    }
  }, [accountType, expenses, income, editAccountType, savingsContributions, deleteAccountType]);

  const handleAction = async (option: string, ptype: AccountTypeModel) => {
    seteditAccountType(ptype);

    if (option === ACTION_TYPES.Edit) {
      setEditMode(true);
      setFormOpen(true);
    } else if (option === ACTION_TYPES.Delete) {
      setDeleteFormOpen(true);
    }
    handleActionClose();
  };

  const { ActionPopover, handleActionOpen, handleActionClose } = useActionPopover({
    actions: [ACTION_TYPES.Edit, ACTION_TYPES.Delete],
    handleAction,
    disabledCondition: (action: string, accountType: AccountTypeModel) =>
      action === ACTION_TYPES.Delete && accountType.description === "Uncategorized",
  });

  const handleSave = (data: { newAccount: string; msg: string }) => {
    setFormOpen(false);
    openSuccessSnackbar(`Account has been ${data.msg}`);
  };
  const { openSuccessSnackbar, SnackbarComponent } = useSnackbarHook();

  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  return (
    <div>
      <Backdrop open={isLoading} sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <CircularProgress color="inherit" />
      </Backdrop>

      <Paper
        sx={{ borderRadius: 2, padding: 2, display: "flex", flexDirection: "column" }}
        variant={isDarkMode ? "elevation" : "outlined"}
      >
        <Grid container p={1} spacing={1} justifyContent="space-between" alignItems="center">
          <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "center" }}>
            <PaymentsOutlinedIcon sx={{ fontSize: iconSizeXS }} />
            <Typography variant="h6" align="left" ml={0.5}>
              Accounts
            </Typography>
          </div>

          <CustomIconButton onClick={handleAddAccountType} type="add" style={{ marginLeft: 2 }}>
            <Typography variant="caption" sx={{ color: ThemeColor(theme) }}>
              New
            </Typography>
            <AddIcon sx={{ fontSize: iconSizeXS }} />
          </CustomIconButton>
        </Grid>

        <GenericListItem items={accountType} onActionSelect={handleActionOpen} icons={AccountsIcons} />
      </Paper>

      {ActionPopover}
      {SnackbarComponent}
      <Dialog
        open={isFormOpen}
        PaperProps={{
          sx: { borderRadius: 1, width: FORM_WIDTH },
        }}
      >
        <DialogContent sx={{ px: 2, py: 1, backgroundColor: isDarkMode ? "#1e1e1e" : "#fff" }}>
          <React.Suspense fallback={<EntryFormSkeleton items={4} />}>
            <AccountsForm
              closeForm={() => setFormOpen(false)}
              editAccountType={editAccountType}
              isEditMode={editMode}
              onSave={handleSave}
            />
          </React.Suspense>
        </DialogContent>
      </Dialog>

      <DeleteConfirmationDialog
        isDialogOpen={deleteFormOpen}
        onClose={() => setDeleteFormOpen(false)}
        onDelete={handleDeleteAccountType}
        description={editAccountType?.description || " "}
      />
    </div>
  );
};

export default AccountsList;
