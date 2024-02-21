import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import React from "react";
import { useSelector } from "react-redux";
import { formatShortAmountWithCurrency } from "../../helper/utils";
import { PERCENTAGE_DECREASE } from "../../constants/componentTheme";
import { RootState } from "../../redux/store";

const BalanceByAccountTypeDetails = React.lazy(() => import("./BalanceByAccountTypeDetails"));

interface AccountDetails {
  balance: number;
  income: number;
  expense: number;
  savings: number;
  color: string;
  icon: string;
}
interface Props {
  filterTitle: string;
  accountType: string;
  totalAmount: number;
  openDialog: boolean;
  onDialogClose: () => void;
  accountDetails: AccountDetails;
}

const BalanceByAccountTypeDialog = (props: Props) => {
  const powerSavingMode = useSelector((state: RootState) => state.powerSaving.enabled);

  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  return (
    <>
      <Dialog
        open={props.openDialog}
        PaperProps={{
          sx: { borderRadius: 2 },
        }}
        onClose={() => props.onDialogClose()}
        fullWidth
        maxWidth="xs"
        transitionDuration={powerSavingMode ? 0 : undefined}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            backgroundColor: isDarkMode ? "#1e1e1e" : "#fff",
            alignItems: "center",
            pb: 2,
          }}
        >
          <Stack direction="row" alignItems="center">
            {props.accountType} {props.filterTitle}
          </Stack>

          <Typography>
            <span
              style={{
                color: props.totalAmount < 0 ? PERCENTAGE_DECREASE : "inherit",
                marginLeft: "5px",
                fontWeight: "bold",
              }}
            >
              {formatShortAmountWithCurrency(props.totalAmount, false, true)}
            </span>
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ px: 3, py: 0, backgroundColor: isDarkMode ? "#1e1e1e" : "#fff", height: 110 }}>
          <React.Suspense
            fallback={
              <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <CircularProgress size={20} />
              </Box>
            }
          >
            <BalanceByAccountTypeDetails accountDetails={props.accountDetails} />
          </React.Suspense>
        </DialogContent>
        <DialogActions
          sx={{
            backgroundColor: isDarkMode ? "#1e1e1e" : "#fff",
          }}
        >
          <Button
            size="small"
            color="inherit"
            onClick={(event) => {
              event.stopPropagation();
              props.onDialogClose();
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default BalanceByAccountTypeDialog;
