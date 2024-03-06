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

const BalanceByAccountTypeBreakdown = React.lazy(() => import("./BalanceByAccountTypeBreakdown"));

interface Props {
  filterTitle: string;
  accountType: string;
  totalAmount: number;
  openDialog: boolean;
  onDialogClose: () => void;
  networth: { expense: number; income: number; savings: number };
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
          sx: { borderRadius: 3 },
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
            <Typography variant="body2">
              {props.accountType} {props.filterTitle}
            </Typography>
          </Stack>

          <Typography variant="body2" sx={{ color: props.totalAmount < 0 ? PERCENTAGE_DECREASE : "inherit" }}>
            {formatShortAmountWithCurrency(props.totalAmount, false, true)}
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ px: 3, py: 0, backgroundColor: isDarkMode ? "#1e1e1e" : "#fff", height: 120 }}>
          <React.Suspense
            fallback={
              <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <CircularProgress size={20} />
              </Box>
            }
          >
            <BalanceByAccountTypeBreakdown networth={props.networth} />
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
