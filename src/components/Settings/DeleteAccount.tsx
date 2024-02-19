import { Button } from "@mui/material";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { reAuthGoogleSignIn } from "../../Helper/AuthHelper";
import { DELETE_ACCT_TIMEOUT } from "../../constants/Sizes";
import { deleteAccountData } from "../../firebase/UsersService";
import { hasInternetConnection } from "../../firebase/utils";
import useSnackbarHook from "../../hooks/snackbarHook";
import { setIsDeleting, setSuccessDeleteMessage } from "../../redux/reducer/deleteAccountSlice";
import { RootState } from "../../redux/store";
import DeleteAccountConfirmationDialog from "../Dialog/DeleteAccountConfirmationDialog";

const DeleteAccount = ({ onDeleteSuccess }: { onDeleteSuccess?: () => void }) => {
  const { openSuccessSnackbar, SnackbarComponent } = useSnackbarHook();
  const [openDeleteConfirmation, setDeleteConfirmation] = useState(false);
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);

  const handleReAuthentication = async () => {
    // const recentSignIn = await isUserSignedInRecently();
    // if (recentSignIn)
    //   await deleteAccountData();
    // }

    //force Re-auth
    const hasActiveNetwork = await hasInternetConnection();

    if (!hasActiveNetwork) {
      openSuccessSnackbar("Active Network is required.", true);
      return;
    }

    // const provider = await getUserAuthProvider();
    // if (provider !== AuthProvider.Google) {
    //   openSuccessSnackbar("Something went wrong.If it persist, try to sign out then re-signIn", true);
    // }

    const response = await reAuthGoogleSignIn();

    if (response !== "Success") {
      openSuccessSnackbar(response, true);
      return;
    }
    try {
      dispatch(setIsDeleting(true));
      const deleted = await Promise.race([
        deleteAccountData(),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Timeout")), DELETE_ACCT_TIMEOUT)),
      ]);

      if (deleted) {
        //call back for seed phrase dialog to close all opened dialogs
        if (onDeleteSuccess) {
          onDeleteSuccess();
        } else {
          dispatch(setSuccessDeleteMessage("Account has been deleted successfully."));
          dispatch(setIsDeleting(false));
        }
      }
    } catch (error) {
      if (error.message === "Timeout") {
        dispatch(setIsDeleting(false));
        openSuccessSnackbar("Something went wrong, if this persists, try reloading App then try again.", true);
        return;
      } else {
        openSuccessSnackbar("Something went wrong, if this persists, try reloading App then try again.", true);
        return;
      }
    }
  };

  return (
    <div>
      <Button
        variant="outlined"
        size="small"
        color="error"
        sx={{ textTransform: "none", height: "27px", borderRadius: 2, width: 150 }}
        onClick={() => setDeleteConfirmation(true)}
      >
        Delete Account
      </Button>
      <DeleteAccountConfirmationDialog
        open={openDeleteConfirmation}
        onDialogClose={() => setDeleteConfirmation(false)}
        onUserConfirmation={async () => {
          setDeleteConfirmation(false);
          if (user?.isAnonymous) {
            dispatch(setIsDeleting(true));
            try {
              const deleted = await Promise.race([
                deleteAccountData(),
                new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Timeout")), DELETE_ACCT_TIMEOUT)),
              ]);

              if (deleted) {
                //call back for seed phrase dialog to close all opened dialogs
                if (onDeleteSuccess) {
                  onDeleteSuccess();
                } else {
                  dispatch(setSuccessDeleteMessage("Account has been deleted successfully."));
                  dispatch(setIsDeleting(false));
                }
              }
            } catch (error) {
              if (error.message === "Timeout") {
                dispatch(setIsDeleting(false));
                openSuccessSnackbar("Something went wrong, if this persists, try reloading App then try again.", true);
                return;
              } else {
                openSuccessSnackbar("Something went wrong, if this persists, try reloading App then try again.", true);
                return;
              }
            }
          } else {
            handleReAuthentication();
          }
        }}
        isUserAnonymous={user?.isAnonymous || false}
      />
      {SnackbarComponent}
    </div>
  );
};

export default DeleteAccount;
