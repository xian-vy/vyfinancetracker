import { Add as AddIcon } from "@mui/icons-material";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import { Dialog, DialogContent, Grid, IconButton, Paper, Typography, useMediaQuery, useTheme } from "@mui/material";
import { ThunkDispatch } from "@reduxjs/toolkit";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ThemeColor } from "../../../helper/utils";
import AccountsIcons from "../../../media/AccountsIcons";
import { FORM_WIDTH, iconSizeXS } from "../../../constants/size";
import { useAccountTypeContext } from "../../../contextAPI/AccountTypeContext";
import { useActionPopover } from "../../../hooks/actionHook";
import useSnackbarHook from "../../../hooks/snackbarHook";
import AccountTypeModel from "../../../models/AccountTypeModel";
import { updateExpenseAction } from "../../../redux/actions/expenseAction";
import { updateincomeAction } from "../../../redux/actions/incomeAction";
import { updateSavingsContributionAction } from "../../../redux/actions/savingsAction";
import { RootState } from "../../../redux/store";
import CustomIconButton from "../../CustomIconButton";
import DeleteConfirmationDialog from "../../Dialog/DeleteConfirmationDialog";
import LoadingDialog from "../../Dialog/LoadingDialog";
import EntryFormSkeleton from "../../Skeleton/EntryFormSkeleton";
const AccountsForm = React.lazy(() => import("./AccountsForm"));

const AccountsList = () => {
  const { accountType, deleteAccountType } = useAccountTypeContext();
  const [isFormOpen, setFormOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [deleteFormOpen, setDeleteFormOpen] = useState(false);
  const dispatch = useDispatch<ThunkDispatch<any, any, any>>();
  const expenses = useSelector((state: RootState) => state.expenses.expenses);
  const savingsContributions = useSelector((state: RootState) => state.savingsContribution.contribution);
  const income = useSelector((state: RootState) => state.income.income);
  const [isLoading, setIsLoading] = useState(false);
  const [editAccountType, seteditAccountType] = useState<AccountTypeModel>({} as AccountTypeModel);

  const handleAddAccountType = () => {
    setEditMode(false);
    setFormOpen(true);
  };

  const handleDeleteAccountType = async () => {
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
  };

  const handleAction = async (option: string, ptype: AccountTypeModel) => {
    seteditAccountType(ptype);

    if (option == "Edit") {
      setEditMode(true);
      setFormOpen(true);
    } else if (option == "Delete") {
      setDeleteFormOpen(true);
    }
    handleActionClose();
  };

  const { ActionPopover, handleActionOpen, handleActionClose } = useActionPopover({
    actions: ["Edit", "Delete"],
    handleAction,
    disabledCondition: (action: string, accountType: AccountTypeModel) =>
      action === "Delete" && accountType.description === "Uncategorized",
  });

  const handleSave = (data: { newAccount: string; msg: string }) => {
    setFormOpen(false);
    openSuccessSnackbar(`Account has been ${data.msg}`);
  };
  const { openSuccessSnackbar, SnackbarComponent } = useSnackbarHook();

  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  function renderIcon(icon: React.ReactElement, color: string) {
    return React.cloneElement(icon, { style: { color: color, fontSize: "18px" } });
  }
  const smScreen = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <div>
      <>{SnackbarComponent}</>
      <Paper
        sx={{ borderRadius: 4, padding: 2, display: "flex", flexDirection: "column" }}
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
        <div style={{ flexGrow: 1, overflow: "auto", paddingBottom: 1 }}>
          <Grid container p={{ xs: 0, md: 1 }} gap={1} justifyContent="left" alignItems="left" px={{ xs: 0, md: 2 }}>
            {accountType.map((ptypes) => {
              const iconObject = AccountsIcons.find((icon) => icon.name === ptypes.icon);

              return (
                <Paper
                  key={ptypes.id}
                  sx={{
                    pl: 1,
                    py: 0,
                    borderRadius: 6,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    backgroundColor: isDarkMode ? "#1e1e1e" : "#fff",
                  }}
                  variant="outlined"
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    {iconObject && renderIcon(iconObject.icon, ptypes.color)}
                    <Typography align="left" pl={1} variant={smScreen ? "caption" : "body1"}>
                      <span style={{ flex: 1 }}>{ptypes.description}</span>
                    </Typography>
                  </div>
                  <IconButton
                    sx={{ ml: 1, py: { xs: 0.5, md: 1 } }}
                    onClick={(event) => handleActionOpen(event, ptypes)}
                  >
                    <MoreHorizIcon fontSize="small" />
                  </IconButton>
                </Paper>
              );
            })}
          </Grid>
        </div>
      </Paper>

      {ActionPopover}

      <Dialog
        open={isFormOpen}
        PaperProps={{
          sx: { borderRadius: 4, width: FORM_WIDTH },
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

      <LoadingDialog isLoading={isLoading} />

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
