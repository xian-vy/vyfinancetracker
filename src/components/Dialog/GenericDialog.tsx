import { Stack, Typography, useTheme } from "@mui/material";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import React from "react";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

export default function GenericDialog({
  open,
  handleClose,
  title,
  content,
}: {
  open: boolean;
  handleClose: () => void;
  title: string;
  content: React.ReactNode;
}) {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  return (
    <React.Fragment>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{
          sx: { background: isDarkMode ? "#1e1e1e" : "#666", borderRadius: 2 },
        }}
      >
        <DialogTitle
          id="alert-dialog-title"
          sx={{
            bgcolor: isDarkMode ? "#323131" : "#666",
            fontSize: "0.8rem",
            color: isDarkMode ? "#ccc" : "#fff",
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="center">
            <InfoOutlinedIcon fontSize="small" sx={{ color: isDarkMode ? "#ccc" : "#fff", mr: 0.5 }} />
            <Typography variant="body2">{title}</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ background: isDarkMode ? "#1e1e1e" : "#fff", pb: 0 }}>{content}</DialogContent>
        <DialogActions sx={{ background: isDarkMode ? "#1e1e1e" : "#fff" }}>
          <Button color="inherit" onClick={handleClose}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
