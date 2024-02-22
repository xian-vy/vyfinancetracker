import { Dialog, Stack, Typography, useTheme } from "@mui/material";
import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
interface LoadingDialogProps {
  type: string;
  isLoading: boolean;
}

const UploadingDialog: React.FC<LoadingDialogProps> = ({ isLoading, type }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const uploadProgress = useSelector((state: RootState) => state.expenses.uploadProgress);
  const isUploading = useSelector((state: RootState) => state.expenses.isUploading);

  return (
    <Dialog
      open={isUploading}
      aria-labelledby="loading-dialog-title"
      PaperProps={{
        sx: { background: isDarkMode ? "#1e1e1e" : "#fff", borderRadius: 3 },
      }}
    >
      <Stack direction="row" justifyContent="center" p={3}>
        <>
          <Typography variant="body1" mr={1}>
            Uploading {type}:
          </Typography>
          <Typography variant="body1" color="textSecondary">
            {Math.round(uploadProgress)}%
          </Typography>
        </>
      </Stack>
    </Dialog>
  );
};

export default UploadingDialog;
