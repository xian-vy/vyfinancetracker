import { Dialog, DialogTitle, DialogContent, Typography, DialogActions, Button, useTheme, Stack } from "@mui/material";
import React from "react";
import { signOutWithGoogle } from "../../Helper/AuthHelper";
import { deleteAccountData, getPersistenceID } from "../../firebase/UsersService";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { setIsDeleting, setSuccessDeleteMessage } from "../../redux/reducer/deleteAccountSlice";
import useSnackbarHook from "../../hooks/snackbarHook";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import { DELETE_ACCT_TIMEOUT } from "../../constants/Sizes";

interface Props {
  open: boolean;
  onDialogClose: () => void;
}
const SignOutConfirmationDialog = (props: Props) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();
  const { openSuccessSnackbar, SnackbarComponent } = useSnackbarHook();

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
            {user?.isAnonymous ? "This action cannot be undone" : "Unsynced changes will be lost if you sign out"}
          </Stack>
        </DialogTitle>

        <DialogContent>
          {!user?.isAnonymous ? (
            <>
              <Typography variant="body1" textAlign="center" gutterBottom mt={1}>
                Open network/wifi to sync and backup changes.
              </Typography>
              <Typography variant="body1" textAlign="center" mt={1}>
                Do you want to continue signing out?
              </Typography>
            </>
          ) : (
            <>
              <Typography variant="body1" textAlign="center" gutterBottom mt={1}>
                Signing out while anonymous will delete all your data.
              </Typography>
              <Typography variant="body1" textAlign="center" mt={1}>
                Do you still want to continue signing out?
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", px: 2 }}>
          <Button size="small" onClick={() => props.onDialogClose()} color="inherit">
            Cancel
          </Button>
          <Button
            size="small"
            onClick={async () => {
              props.onDialogClose();
              if (user?.isAnonymous) {
                if (navigator.onLine) {
                  dispatch(setIsDeleting(true));

                  try {
                    const deleted = await Promise.race([
                      deleteAccountData(),
                      new Promise<never>((_, reject) =>
                        setTimeout(() => reject(new Error("Timeout")), DELETE_ACCT_TIMEOUT)
                      ),
                    ]);

                    if (deleted) {
                      dispatch(setSuccessDeleteMessage("Account has been deleted successfully."));
                      dispatch(setIsDeleting(false));
                    }
                  } catch (error: any) {
                    if (error.message === "Timeout") {
                      dispatch(setIsDeleting(false));
                      openSuccessSnackbar(
                        "Something went wrong, if this persists, try reloading App then try again.",
                        true
                      );
                      return;
                    } else {
                      openSuccessSnackbar(
                        "Something went wrong, if this persists, try reloading App then try again.",
                        true
                      );
                      return;
                    }
                  }
                } else {
                  const persistenceID = await getPersistenceID();
                  signOutWithGoogle();
                  Object.keys(localStorage).forEach((key) => {
                    if (key.endsWith(persistenceID)) {
                      localStorage.removeItem(key);
                    }
                  });
                }
              } else {
                const persistenceID = await getPersistenceID();
                signOutWithGoogle();

                Object.keys(localStorage).forEach((key) => {
                  if (key.endsWith(persistenceID)) {
                    localStorage.removeItem(key);
                  }
                });
              }
            }}
            color="error"
          >
            Sign Out
          </Button>
        </DialogActions>
      </Dialog>
      {SnackbarComponent}
    </div>
  );
};

export default SignOutConfirmationDialog;
