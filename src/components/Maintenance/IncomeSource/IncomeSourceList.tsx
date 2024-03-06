import { Add as AddIcon } from "@mui/icons-material";
import LocalAtmOutlinedIcon from "@mui/icons-material/LocalAtmOutlined";
import { Backdrop, CircularProgress, Dialog, DialogContent, Grid, Paper, Typography, useTheme } from "@mui/material";
import { ThunkDispatch } from "@reduxjs/toolkit";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FORM_WIDTH, iconSizeXS } from "../../../constants/size";
import { useIncomeSourcesContext } from "../../../contextAPI/IncomeSourcesContext";
import { ThemeColor } from "../../../helper/utils";
import { useActionPopover } from "../../../hooks/actionHook";
import useSnackbarHook from "../../../hooks/snackbarHook";
import IncomeSourcesModel from "../../../models/IncomeSourcesModel";
import { updateincomeAction } from "../../../redux/actions/incomeAction";
import { RootState } from "../../../redux/store";
import CustomIconButton from "../../CustomIconButton";
import DeleteConfirmationDialog from "../../Dialog/DeleteConfirmationDialog";
import EntryFormSkeleton from "../../Skeleton/EntryFormSkeleton";
import GenericListItem from "../GenericListItem";
import { ACTION_TYPES } from "../../../constants/constants";
import IncomeSourceIcons from "../../../media/IncomeSourceIcons";
const IncomeSourceForm = React.lazy(() => import("./IncomeSourceForm"));

const IncomeSourceList = () => {
  const { incomeSource, deleteIncomeSources } = useIncomeSourcesContext();
  const [deleteFormOpen, setDeleteFormOpen] = useState(false);
  const dispatch = useDispatch<ThunkDispatch<any, any, any>>();
  const income = useSelector((state: RootState) => state.income.income);
  const [isLoading, setIsLoading] = useState(false);
  const [isFormOpen, setFormOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editIncomeSource, setIncomeSource] = useState<IncomeSourcesModel>({} as IncomeSourcesModel);

  const handleAddCategory = () => {
    setEditMode(false);
    setFormOpen(true);
  };

  const handleDeleteIncomeSource = async () => {
    try {
      const IncomeWithSameCategory = income.filter((inc) => {
        return inc.category_id === editIncomeSource.id;
      });

      const uncategorized = incomeSource.find((category) => {
        return category.description === "Uncategorized";
      });

      const uncategorizedId = uncategorized ? uncategorized.id : "";

      if (IncomeWithSameCategory.length > 0) {
        setIsLoading(true);

        await Promise.all(
          IncomeWithSameCategory.map((income) =>
            dispatch(updateincomeAction({ ...income, category_id: uncategorizedId }))
          )
        );
      }

      deleteIncomeSources(editIncomeSource.id);

      openSuccessSnackbar(`Income Source has been deleted`);
    } catch (error) {
      console.log("Delete Income Source failed", error);
    } finally {
      setDeleteFormOpen(false);
      setIsLoading(false);
    }
  };

  const handleAction = async (option: string, isource: IncomeSourcesModel) => {
    setIncomeSource(isource);
    if (option == ACTION_TYPES.Edit) {
      setEditMode(true);
      setFormOpen(true);
    } else if (option == ACTION_TYPES.Delete) {
      setDeleteFormOpen(true);
    }
    handleActionClose();
  };

  const { ActionPopover, handleActionOpen, handleActionClose } = useActionPopover({
    actions: [ACTION_TYPES.Edit, ACTION_TYPES.Delete],
    handleAction,
    disabledCondition: (action: string, incomesource: IncomeSourcesModel) =>
      action === ACTION_TYPES.Delete && incomesource.description === "Uncategorized",
  });

  const handleSave = (data: { newIncomeSource: string; msg: string }) => {
    setFormOpen(false);
    openSuccessSnackbar(`Income source has been ${data.msg}`);
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
        sx={{ borderRadius: 4, padding: 2, display: "flex", flexDirection: "column" }}
        variant={isDarkMode ? "elevation" : "outlined"}
      >
        <Grid container p={1} spacing={1} justifyContent="space-between" alignItems="center">
          <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "center" }}>
            <LocalAtmOutlinedIcon sx={{ fontSize: iconSizeXS }} />
            <Typography variant="h6" align="left" ml={0.5}>
              Income Sources
            </Typography>
          </div>

          <CustomIconButton onClick={handleAddCategory} type="add" style={{ marginLeft: 2 }}>
            <Typography variant="caption" sx={{ color: ThemeColor(theme) }}>
              New
            </Typography>
            <AddIcon sx={{ fontSize: iconSizeXS }} />
          </CustomIconButton>
        </Grid>
        <GenericListItem items={incomeSource} onActionSelect={handleActionOpen} icons={IncomeSourceIcons} />
      </Paper>

      {ActionPopover}
      {SnackbarComponent}
      <Dialog
        open={isFormOpen}
        PaperProps={{
          sx: { borderRadius: 4, width: FORM_WIDTH },
        }}
      >
        <DialogContent sx={{ px: 2, py: 1, backgroundColor: isDarkMode ? "#1e1e1e" : "#fff" }}>
          <React.Suspense fallback={<EntryFormSkeleton items={4} />}>
            <IncomeSourceForm
              closeForm={() => setFormOpen(false)}
              editIncomeSource={editIncomeSource}
              isEditMode={editMode}
              onSave={handleSave}
            />
          </React.Suspense>
        </DialogContent>
      </Dialog>

      <DeleteConfirmationDialog
        isDialogOpen={deleteFormOpen}
        onClose={() => setDeleteFormOpen(false)}
        onDelete={handleDeleteIncomeSource}
        description={editIncomeSource?.description || " "}
      />
    </div>
  );
};

export default IncomeSourceList;
