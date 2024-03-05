import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography, useTheme } from "@mui/material";
interface Props {
  isDialogOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
  description: string;
}

const DeleteConfirmationDialog = (props: Props) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  return (
    <Dialog
      open={props.isDialogOpen}
      onClose={props.onClose}
      PaperProps={{
        sx: { background: isDarkMode ? "#1e1e1e" : "#fff", borderRadius: 2, width: 400 },
      }}
    >
      <DialogTitle>
        <Typography textAlign="center">Are you sure you want to delete the item?</Typography>
      </DialogTitle>
      <DialogContent sx={{ px: 1, py: 3 }}>
        <Typography textAlign="center">{props.description.toUpperCase()}</Typography>
      </DialogContent>
      <DialogActions sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
        <Button onClick={() => props.onClose()} color="inherit" fullWidth sx={{ mx: 2 }}>
          Cancel
        </Button>
        <Button onClick={props.onDelete} color="error" fullWidth sx={{ mx: 2 }}>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmationDialog;
