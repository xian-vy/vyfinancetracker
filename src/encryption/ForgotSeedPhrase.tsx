import CloseIcon from "@mui/icons-material/Close";
import { Dialog, DialogContent, DialogTitle, IconButton, Stack, Typography } from "@mui/material";
import React from "react";
import DeleteAccount from "../components/Settings/DeleteAccount";

const ForgotSeedPhrase = ({
  isDarkMode,
  openForgotSeedPhrase,
  onClose,
  onDeleteAccount,
}: {
  isDarkMode: boolean;
  openForgotSeedPhrase: boolean;
  onClose: () => void;
  onDeleteAccount?: () => void;
}) => {
  return (
    <div>
      <Dialog
        open={openForgotSeedPhrase}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2, background: isDarkMode ? "#1e1e1e" : "#fff" },
        }}
        slotProps={{
          backdrop: {
            sx: { backgroundColor: "rgba(0,   0,   0,   0.9)" },
          },
        }}
      >
        <DialogTitle align="right" sx={{ pt: 1, pb: 0 }}>
          <IconButton onClick={onClose} sx={{ mr: -1.5 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Typography variant="body2" gutterBottom textAlign="center">
            Your seed phrase cannot be recovered.
          </Typography>
          <Typography variant="body2" gutterBottom textAlign="center">
            It's unique to your account and crucial for data security.
          </Typography>
          <Typography variant="body2" textAlign="center">
            To use the app again, you must delete your account data and sign in afresh, which will create an account
            with no existing data.
          </Typography>
        </DialogContent>
        <Stack direction="row" justifyContent="center" mb={1}>
          <DeleteAccount
            onDeleteSuccess={() => {
              if (onDeleteAccount) {
                onDeleteAccount();
              }
              onClose();
            }}
          />
        </Stack>
      </Dialog>
    </div>
  );
};

export default ForgotSeedPhrase;
