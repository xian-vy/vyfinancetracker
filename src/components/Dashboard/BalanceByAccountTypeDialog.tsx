import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import React from "react";
import { useSelector } from "react-redux";
import { PERCENTAGE_DECREASE } from "../../constants/componentTheme";
import { formatNumberWithoutCurrency } from "../../helper/utils";
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
          sx: { borderRadius: 2 },
        }}
        onClose={() => props.onDialogClose()}
        fullWidth
        maxWidth="xs"
        transitionDuration={powerSavingMode ? 0 : undefined}
      >
        <DialogTitle
          sx={{
            backgroundColor: isDarkMode ? "#1e1e1e" : "#fff",
            pb: 2,
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between" width="100%" mb={1}>
            <Typography variant="body2">
              {props.accountType} {props.filterTitle}
            </Typography>
            <IconButton size="small" onClick={() => props.onDialogClose()}>
              <CloseIcon />
            </IconButton>
          </Stack>
          <Divider sx={{ width: "100%", mb: 2 }} />

          <Typography
            textAlign="center"
            variant="h4"
            sx={{ color: props.totalAmount < 0 ? PERCENTAGE_DECREASE : "inherit", fontWeight: "bold" }}
          >
            {formatNumberWithoutCurrency(props.totalAmount)}
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ px: 3, py: 0, backgroundColor: isDarkMode ? "#1e1e1e" : "#fff", height: 135 }}>
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
      </Dialog>
    </>
  );
};

export default BalanceByAccountTypeDialog;
