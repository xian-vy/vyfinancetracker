import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography, useTheme } from "@mui/material";
import React, { useEffect, useState } from "react";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";

interface Props {
  open: boolean;
  onDialogClose: () => void;
  onUserConfirmation: () => void;
  isUserAnonymous: boolean;
}

const DeleteAccountConfirmationDialog = (props: Props) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const [deleteDisabled, setDeleteDisabled] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    if (props.isUserAnonymous) {
      setDeleteDisabled(true);
      let counter = 5;
      const interval = window.setInterval(() => {
        setCountdown(counter);
        counter--;
        if (counter < 0) {
          window.clearInterval(interval);
          setDeleteDisabled(false);
          setCountdown(null);
        }
      }, 1000);
      return () => window.clearInterval(interval);
    }
  }, [props.open]);
  return (
    <div>
      <Dialog
        open={props.open}
        onClose={() => props.onDialogClose()}
        PaperProps={{
          sx: { background: isDarkMode ? "#1e1e1e" : "#fff", width: 420 },
        }}
      >
        <DialogTitle
          id="alert-dialog-title"
          sx={{
            bgcolor: "maroon",
            fontSize: "0.9rem",
            color: isDarkMode ? "#ccc" : "#fff",
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="center">
            <WarningAmberOutlinedIcon fontSize="small" sx={{ color: isDarkMode ? "#ccc" : "#fff", mr: 1 }} />
            This action cannot be undone
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ mt: 1, justifyContent: "center", display: "flex" }}>
          {props.isUserAnonymous ? (
            <Typography variant="body1" textAlign="center" gutterBottom mt={1}>
              Are you sure you want to delete your Account?
            </Typography>
          ) : (
            <Typography variant="body1" textAlign="center" gutterBottom mt={1}>
              For your account security, you will be required to re-authenticate
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", px: 2 }}>
          <Button size="small" onClick={() => props.onDialogClose()} color="inherit">
            Cancel
          </Button>
          <Button
            color={props.isUserAnonymous ? "error" : "primary"}
            size="small"
            onClick={() => props.onUserConfirmation()}
            disabled={deleteDisabled}
          >
            {props.isUserAnonymous && countdown !== null
              ? `Delete Account (${countdown})`
              : props.isUserAnonymous
              ? "Delete Account"
              : "Confirm Account"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default DeleteAccountConfirmationDialog;
