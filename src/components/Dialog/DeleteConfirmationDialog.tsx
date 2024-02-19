import CloseIcon from "@mui/icons-material/Close";
import { Box, Button, Dialog, DialogActions, DialogContent, IconButton, Typography, useTheme } from "@mui/material";
import React from "react";
import ClearIcon from "@mui/icons-material/Clear";

interface Props {
  isDialogOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
  date: string;
  description: string;
  description2: string;
}

const DeleteConfirmationDialog = (props: Props) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  return (
    <Dialog
      open={props.isDialogOpen}
      onClose={props.onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: { background: isDarkMode ? "#1e1e1e" : "#fff", borderRadius: 3 },
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ px: 2, py: 2 }}>
        <Typography variant="body2" mt={0.3}>
          <strong>{props.description.toUpperCase().substring(0, 30) + ".."} </strong>
        </Typography>
        <IconButton
          onClick={() => props.onClose()}
          style={{
            cursor: "pointer",
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>
      <DialogContent sx={{ pt: 0, px: 1, pb: 1 }}>
        {props.description2 && (
          <Typography variant="body1" pl={2}>
            <strong>Category:</strong> {props.description2}
          </Typography>
        )}
        {props.date && (
          <Typography variant="body1" pl={2} mt={0.5}>
            <strong>Date:</strong> {props.date}
          </Typography>
        )}
        <DialogActions sx={{ display: "flex", justifyContent: "flex-end", mt: 2, mx: 1 }}>
          <Button
            size="small"
            variant="outlined"
            onClick={props.onDelete}
            color="error"
            endIcon={<ClearIcon fontSize="small" sx={{ color: theme.palette.error.main }} />}
          >
            Delete
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteConfirmationDialog;
