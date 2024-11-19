import { Button, Dialog, DialogActions, DialogContent, Typography, useTheme } from "@mui/material";
interface Props {
  isDialogOpen: boolean;
  onClose: () => void;
  onAgreed: () => void;
  markAsPaid : boolean
  isCreditor : boolean
  amount : number
}

const PaymentConfirmationDialog = (props: Props) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  return (
    <Dialog
      open={props.isDialogOpen}
      onClose={props.onClose}
      PaperProps={{
        sx: { background: isDarkMode ? "#1e1e1e" : "#fff", borderRadius: 1, width: 400 },
      }}
    >

      <DialogContent sx={{ px: 1, py: 3 }}>
        {props.isCreditor ? (
            <Typography textAlign="center">This Will {props.markAsPaid ? " Remove" : " Add"} {props.amount} to your Balance</Typography>
        ): (
            <Typography textAlign="center">This Will {props.markAsPaid ? " Add" : " Remove"} {props.amount} to your Balance</Typography>
        )}
     
      </DialogContent>
      <DialogActions sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
        <Button onClick={() => props.onClose()} color="inherit" fullWidth sx={{ mx: 2 }}>
          Cancel
        </Button>
        <Button onClick={props.onAgreed} color={props.markAsPaid ? "error" : "success"} fullWidth sx={{ mx: 2 }}>
          Mark as {props.markAsPaid ? " Unpaid" : " Paid"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentConfirmationDialog;
