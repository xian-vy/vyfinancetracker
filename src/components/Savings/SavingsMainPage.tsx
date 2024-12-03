import { Add } from "@mui/icons-material";
import {
  Backdrop,
  CircularProgress,
  Dialog,
  DialogContent,
  Grid,
  Paper,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { ThunkDispatch } from "@reduxjs/toolkit";
import { Timestamp } from "firebase/firestore";
import React, { useLayoutEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { operation_types, txn_types } from "../../constants/collections";
import { ACTION_TYPES } from "../../constants/constants";
import { FORM_WIDTH, iconSizeXS } from "../../constants/size";
import { useTransactionLogsContext } from "../../contextAPI/TransactionLogsContext";
import { ThemeColor } from "../../helper/utils";
import useSnackbarHook from "../../hooks/snackbarHook";
import SavingGoalsModel from "../../models/SavingGoalsModel";
import TransactionLogsModel from "../../models/TransactionLogsModel";
import {
  addSavingsAction,
  deleteAllContributionsForSavingsAction,
  deleteSavingsAction,
  updateSavingsAction,
} from "../../redux/actions/savingsAction";
import { RootState } from "../../redux/store";
import SavingsTrend from "../Charts/Savings/SavingsTrend";
import CustomIconButton from "../CustomIconButton";
import DeleteConfirmationDialog from "../Dialog/DeleteConfirmationDialog";
import FilterSavings from "../Filter/FilterSavings";
import EntryFormSkeleton from "../Skeleton/EntryFormSkeleton";
import SavingsForm from "./SavingsForm";
import { SavingsItems } from "./SavingsItems";
const SavingsContributionForm = React.lazy(() => import("./SavingsContributionForm"));
const SavingsMainPage = () => {
  const location = useLocation();
  const { openForm } = location.state || {};
  const powerSavingMode = useSelector((state: RootState) => state.powerSaving.enabled);
  const [editMode, setEditMode] = useState(false);
  const [savingsFormOpen, setSavingsFormOpen] = useState(false);
  const [contributionFormOpen, setContributionFormOpen] = useState(openForm || false);
  const [isLoading, setIsLoading] = useState(false);
  const [filterOption, setFilterOption] = useState("In Progress");
  const dispatch = useDispatch<ThunkDispatch<any, any, any>>();
  const savingsSlice : SavingGoalsModel[] = useSelector((state: RootState) => state.savings.savings);
  const [deleteFormOpen, setDeleteFormOpen] = useState(false);
  const { openSuccessSnackbar, SnackbarComponent } = useSnackbarHook();
  const filteredSavings = savingsSlice.filter((saving) => {
    return saving.status === filterOption;
  });

  const { saveLogs } = useTransactionLogsContext();
  const [editedSavings, setEditedSavings] = useState({} as SavingGoalsModel);

  const handleCloseForm = () => {
    setContributionFormOpen(false);
    setSavingsFormOpen(false);
    setEditMode(false);
    setDeleteFormOpen(false);
  };

  const handleAddSavings = async (savings: SavingGoalsModel) => {
    handleCloseForm();
    const newIcon = savings.icon === "" ? "No Icon" : savings.icon;
    try {
      setIsLoading(true);

      let savingsId: string | undefined = "";

      if (editMode) {
        await dispatch(updateSavingsAction(savings));
        savingsId = savings.id;
        setEditMode(false);
      } else {
        const resultAction = await dispatch(addSavingsAction({ ...savings, icon: newIcon }));
        if (addSavingsAction.fulfilled.match(resultAction)) {
          savingsId = resultAction.payload.id;
        }
      }

      if (!editMode || (editMode && editedSavings.targetAmount !== savings.targetAmount)) {
        const log: TransactionLogsModel = {
          txn_id: "",
          txn_ref_id: savingsId,
          txn_type: txn_types.Savings,
          operation: editMode ? operation_types.Update : operation_types.Create,
          category_id: savingsId, //Savings id has no categories
          account_id: "",
          amount: savings.targetAmount,
          lastModified: Timestamp.now(),
        };

        await saveLogs(log);
      }
    } catch (error) {
      console.log("Add Savings failed", error);
    } finally {
      setIsLoading(false);
    }
    setTimeout(() => {
      openSuccessSnackbar(`Saving Goal has been ${editMode ? "Updated" : "Added"}`);
    }, 300);
  };

  const handleActionSelect = async (option: string, savings: SavingGoalsModel) => {
    setEditedSavings(savings);

    if (option === ACTION_TYPES.Edit && editedSavings) {
      setSavingsFormOpen(true);
      setEditMode(true);
    } else if (option === ACTION_TYPES.AddContribution) {
      setContributionFormOpen(true);
    } else if (option === ACTION_TYPES.Delete) {
      setDeleteFormOpen(true);
    }
  };

  const handleDeleteSavings = async () => {
    handleCloseForm();
    try {
      setIsLoading(true);
      const log: TransactionLogsModel = {
        txn_id: "",
        txn_ref_id: editedSavings.id,
        txn_type: txn_types.Savings,
        operation: operation_types.Delete,
        category_id: editedSavings.id, //Savings id has no categories
        account_id: "",
        amount: editedSavings.currentAmount,
        lastModified: Timestamp.now(),
      };

      await saveLogs(log);
      await dispatch(deleteSavingsAction(editedSavings.id));
      await dispatch(deleteAllContributionsForSavingsAction(editedSavings.id));
    } catch (error) {
      console.log("Savings delete failed", error);
    } finally {
      setIsLoading(false);
    }
    openSuccessSnackbar("Saving Goal has been deleted!");
  };

  const handleFilterChange = (filter: string) => {
    setFilterOption(filter);
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
          <Paper sx={{ borderRadius: 2 }} variant={isDarkMode ? "elevation" : "outlined"}>
            <SavingsTrend />
          </Paper>
        </Grid>
        <Grid item xs={12} lg={12}>
          <Paper
            sx={{ py: 1, px: { xs: 0, sm: 1, md: 2 }, minHeight: 600, borderRadius: 2 }}
            variant={isDarkMode ? "elevation" : "outlined"}
          >
            <Stack direction="column" mr={1}>
              <Stack direction="row" justifyContent="end" alignItems="center">
                <Stack direction="row" alignItems="center">
                  <FilterSavings filter={filterOption} onFilterChange={handleFilterChange} />

                  <CustomIconButton onClick={() => setSavingsFormOpen(true)} type="add">
                    <Typography variant="caption" sx={{ color: ThemeColor(theme) }}>
                      New
                    </Typography>
                    <Add sx={{ fontSize: iconSizeXS }} />
                  </CustomIconButton>
                </Stack>
              </Stack>
              {/** Savings List Main Container---------------------------------------------------------------------------*/}
              <Grid container padding={1} spacing={2} paddingTop={2}>
                {/** Savings Items Container------------------------------------------------------------------------*/}
                {filteredSavings.map((savings) => (
                  <SavingsItems key={savings.id} onActionSelect={handleActionSelect} savings={savings} />
                ))}
              </Grid>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Dialog
        open={savingsFormOpen}
        PaperProps={{
          sx: { borderRadius: 1, background: isDarkMode ? "#1e1e1e" : "#fff", width: FORM_WIDTH },
        }}
        transitionDuration={powerSavingMode ? 0 : undefined}
      >
        <DialogContent sx={{ px: 3, py: 2 }}>
          <SavingsForm
            onAddSavings={handleAddSavings}
            EditSavings={editedSavings}
            isEditMode={editMode}
            onCloseForm={handleCloseForm}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={contributionFormOpen}
        PaperProps={{
          sx: { borderRadius: 1, background: isDarkMode ? "#1e1e1e" : "#fff", width: FORM_WIDTH },
        }}
        onClose={() => setContributionFormOpen(false)}
      >
        <DialogContent sx={{ px: 2, py: 1 }}>
          <React.Suspense fallback={<EntryFormSkeleton items={4} />}>
            <SavingsContributionForm EditSavings={editedSavings} onCloseForm={handleCloseForm} />
          </React.Suspense>
        </DialogContent>
      </Dialog>

      <DeleteConfirmationDialog
        isDialogOpen={deleteFormOpen}
        onClose={handleCloseForm}
        onDelete={handleDeleteSavings}
        description={editedSavings?.description || ""}
      />
      {SnackbarComponent}
    </>
  );
};

export default SavingsMainPage;
