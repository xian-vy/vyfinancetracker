import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { Button, Dialog, DialogContent, Hidden, Stack, useTheme } from "@mui/material";
import { ThunkDispatch } from "@reduxjs/toolkit";
import React, { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAccountTypeContext } from "../../contextAPI/AccountTypeContext";
import { useCategoryContext } from "../../contextAPI/CategoryContext";
import { hasInternetConnection } from "../../firebase/utils";
import { ThemeColor } from "../../helper/utils";
import useSnackbarHook from "../../hooks/snackbarHook";
import { RootState } from "../../redux/store";
import UploadInvalidDateDialog from "../Dialog/UploadInvalidDateDialog";
import { processAndUploadFile, uploadExpenses } from "./ExpenseFileUploadHelper";

const ExpenseFileUploadStepper = React.lazy(() => import("../Stepper/ExpenseFileUploadStepper"));

const ExpenseFileUpload = () => {
  const { openSuccessSnackbar, SnackbarComponent } = useSnackbarHook();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const [isStepperFormOpen, setIsStepperFormOpen] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  let { accountType } = useAccountTypeContext();
  let { categories } = useCategoryContext();
  const [invalidExpenses, setInvalidExpenses] = useState<any>([]);
  const dispatch = useDispatch<ThunkDispatch<any, any, any>>();
  const [isCheckingNetwork, setIsCheckingNetwork] = useState(false);
  const isUploading = useSelector((state: RootState) => state.expenses.isUploading);

  const handleFileClick = async () => {
    setIsCheckingNetwork(true);

    const isConnected = await hasInternetConnection();
    setIsCheckingNetwork(false);

    if (!isConnected) {
      openSuccessSnackbar("This feature is not available Offline.", true);
      return;
    }

    const inputElement = document.getElementById("file-upload-input");
    if (inputElement) {
      inputElement.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      processAndUploadFile({ selectedFile, openSuccessSnackbar, dispatch, handleUploadExpenses });
    }
    event.target.value = "";
  };

  const handleUploadExpenses = useCallback(
    async (expensesData: any[]) => {
      const result = await uploadExpenses({ expensesData, categories, accountType, dispatch });

      //Upload Error Message
      if (Array.isArray(result)) {
        setErrorDialogOpen(true);
        setInvalidExpenses(result);
      } else {
        openSuccessSnackbar("Your expenses have been uploaded!");
      }
    },
    [uploadExpenses, categories, accountType, dispatch, setErrorDialogOpen, setInvalidExpenses, openSuccessSnackbar]
  );

  const handleDialogClose = () => {
    setErrorDialogOpen(false);
  };

  const handleCloseForm = () => {
    setIsStepperFormOpen(false);
  };

  return (
    <>
      <input
        type="file"
        accept=".xls,.xlsx"
        onChange={handleFileChange}
        style={{ display: "none" }}
        id="file-upload-input"
        disabled={isUploading}
      />
      <Stack direction="row" alignItems="center" ml={{ xs: 0, md: 2 }}>
        <FileUploadOutlinedIcon sx={{ fontSize: "16px" }} onClick={handleFileClick} />

        <Hidden smDown>
          <Button
            component="span"
            color="inherit"
            onClick={handleFileClick}
            sx={{
              color: ThemeColor(theme),
              minWidth: { xs: 35, md: 48 },
              textTransform: "none",
              fontSize: "12px",
            }}
            disabled={isCheckingNetwork}
          >
            Import
          </Button>
        </Hidden>
        <HelpOutlineIcon
          sx={{ fontSize: "14px", cursor: "pointer", ml: { xs: 1, md: 0 } }}
          onClick={() => setIsStepperFormOpen(true)}
        />
      </Stack>

      <UploadInvalidDateDialog
        isDialogOpen={errorDialogOpen}
        onClose={handleDialogClose}
        msgTitle="Upload successful, but.."
        msgHeader="Some entries have invalid date formats and/or exceeding characters count:"
        msgBody={invalidExpenses}
        bg={isDarkMode ? "#1e1e1e" : "#fff"}
      />

      <Dialog
        open={isStepperFormOpen}
        onClose={handleCloseForm}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: { margin: { xs: 0, sm: 1, md: 2 } },
        }}
      >
        <React.Suspense fallback={<div>loading...</div>}>
          <DialogContent
            sx={{
              background: isDarkMode ? "#1e1e1e" : "#fff",
              px: { xs: 1, sm: 2, md: 3 },
              py: { xs: 1, sm: 2 },
              maxHeight: 500,
            }}
          >
            <ExpenseFileUploadStepper closeForm={() => setIsStepperFormOpen(false)} />
          </DialogContent>
        </React.Suspense>
      </Dialog>

      <div> {SnackbarComponent}</div>
    </>
  );
};

export default React.memo(ExpenseFileUpload);
