import { Add as AddIcon } from "@mui/icons-material";
import LocalAtmOutlinedIcon from "@mui/icons-material/LocalAtmOutlined";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { Dialog, DialogContent, Grid, IconButton, Paper, Typography, useMediaQuery, useTheme } from "@mui/material";
import { ThunkDispatch } from "@reduxjs/toolkit";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ThemeColor } from "../../../helper/utils";
import IncomeSourceIcons from "../../../media/IncomeSourceIcons";
import { FORM_WIDTH, iconSizeXS } from "../../../constants/size";
import { useIncomeSourcesContext } from "../../../contextAPI/IncomeSourcesContext";
import { useActionPopover } from "../../../hooks/actionHook";
import useSnackbarHook from "../../../hooks/snackbarHook";
import IncomeSourcesModel from "../../../models/IncomeSourcesModel";
import { updateincomeAction } from "../../../redux/actions/incomeAction";
import { RootState } from "../../../redux/store";
import CustomIconButton from "../../CustomIconButton";
import DeleteConfirmationDialog from "../../Dialog/DeleteConfirmationDialog";
import LoadingDialog from "../../Dialog/LoadingDialog";
import EntryFormSkeleton from "../../Skeleton/EntryFormSkeleton";
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

      await deleteIncomeSources(editIncomeSource.id);

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
    disabledCondition: (action: string, incomesource: IncomeSourcesModel) =>
      action === "Delete" && incomesource.description === "Uncategorized",
  });

  const handleSave = (data: { newIncomeSource: string; msg: string }) => {
    setFormOpen(false);
    openSuccessSnackbar(`Income source has been ${data.msg}`);
  };
  const { openSuccessSnackbar, SnackbarComponent } = useSnackbarHook();

  function renderIcon(icon: React.ReactElement, color: string) {
    return React.cloneElement(icon, { style: { color: color, fontSize: "18px" } });
  }

  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
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
        <div style={{ flexGrow: 1, overflow: "auto", paddingBottom: 1 }}>
          <Grid container p={{ xs: 0, md: 1 }} gap={1} justifyContent="left" alignItems="left" px={{ xs: 0, md: 2 }}>
            {incomeSource.map((isource) => {
              const iconObject = IncomeSourceIcons.find((icon) => icon.name === isource.icon);
              return (
                <Paper
                  key={isource.id}
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
                    {iconObject && renderIcon(iconObject.icon, isource.color)}
                    <Typography align="left" pl={1} variant={smScreen ? "caption" : "body1"}>
                      <span style={{ flex: 1 }}>{isource.description}</span>
                    </Typography>
                  </div>

                  <IconButton
                    sx={{ ml: 1, py: { xs: 0.5, md: 1 } }}
                    onClick={(event) => handleActionOpen(event, isource)}
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
            <IncomeSourceForm
              closeForm={() => setFormOpen(false)}
              editIncomeSource={editIncomeSource}
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
        onDelete={handleDeleteIncomeSource}
        description={editIncomeSource?.description || " "}
      />
    </div>
  );
};

export default IncomeSourceList;
