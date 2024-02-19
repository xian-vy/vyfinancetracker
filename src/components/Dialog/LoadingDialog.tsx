import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogContentText, CircularProgress, Typography } from "@mui/material";

interface LoadingDialogProps {
  isLoading: boolean;
}

const LoadingDialog: React.FC<LoadingDialogProps> = ({ isLoading }) => {
  return (
    <Dialog open={isLoading} aria-labelledby="loading-dialog-title">
      <DialogTitle id="loading-dialog-title">Please wait</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "row" }}>
        <Typography>The operation is in progress...</Typography>
        <CircularProgress color="primary" size={15} sx={{ ml: 1 }} />
      </DialogContent>
    </Dialog>
  );
};

export default LoadingDialog;
