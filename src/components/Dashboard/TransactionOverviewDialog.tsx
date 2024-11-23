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
} from "@mui/material";
import React from "react";
import { useSelector } from "react-redux";
import { txn_summary } from "../../constants/collections";
import { PERCENTAGE_DECREASE } from "../../constants/componentTheme";
import { DASHBOARD_DIALOG, DIALOG_CLOSEICON_SIZE } from "../../constants/size";
import { FilterTimeframe } from "../../constants/timeframes";
import { formatNumberWithoutCurrency } from "../../helper/utils";
import { RootState } from "../../redux/store";
interface Props {
  filterOption: FilterTimeframe;
  filterTitle: string;
  startDate: Date | null;
  endDate: Date | null;
  txnType: string;
  totalAmount: number;
  openDialog: boolean;
  onDialogClose: () => void;
  networth?: { expenseSum: number; incomeSum: number; contributionSum: number , debtSum: number};
  selectedCategories?: string[];
  isDarkMode: boolean;
}

const BalanceByAccountTypeBreakdown = React.lazy(() => import("./BalanceByAccountTypeBreakdown"));
const TopBudgetsContainer = React.lazy(() => import("../Charts/Budget/TopBudgetsContainer"));
const TopExpensesContainer = React.lazy(() => import("../Charts/Expenses/TopExpensesContainer"));
const TopIncomeContainer = React.lazy(() => import("../Charts/Income/TopIncomeContainer"));
const TopSavingsContributionsContainer = React.lazy(() => import("../Charts/Savings/TopSavingsContributionsContainer"));
const DebtBreakdownByType = React.lazy(() => import("./DebtBreakdownByType"));

const TransactionOverviewDialog = (props: Props) => {
  const powerSavingMode = useSelector((state: RootState) => state.powerSaving.enabled);

  return (
    <>
      <Dialog
        open={props.openDialog}
        onClose={() => props.onDialogClose()}
        PaperProps={{
          sx: { borderRadius: 2 },
        }}
        fullWidth
        maxWidth="xs"
        transitionDuration={powerSavingMode ? 0 : undefined}
      >
        <DialogTitle
          sx={{
            display: "flex",
            flexDirection: "column",
            backgroundColor: props.isDarkMode ? "#1e1e1e" : "#fff",
            alignItems: "center",
            pb: 2,
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between" width="100%" mb={1}>
            <Typography variant="body2">
              {props.txnType} {props.filterTitle}
            </Typography>
            <CloseIcon sx={{ cursor: "pointer",fontSize:DIALOG_CLOSEICON_SIZE }} onClick={() => props.onDialogClose()}/>
          </Stack>
          <Divider sx={{ width: "100%", mb: 2 }} />

          <Typography
            textAlign="center"
            variant="h4"
            sx={{ color: props.totalAmount < 0 ? PERCENTAGE_DECREASE : "inherit", fontWeight: "bold" }}
          >
            {formatNumberWithoutCurrency(Math.round(props.totalAmount))}
          </Typography>
        </DialogTitle>

        <DialogContent
          sx={{
            px: 3,
            pt: 0,
            pb: 2,
            backgroundColor: props.isDarkMode ? "#1e1e1e" : "#fff",
            minHeight: props.txnType === txn_summary.Balance ? 130 : DASHBOARD_DIALOG + 60, //allowance for breadcrumbs
            maxHeight: props.txnType === txn_summary.Balance ? 280 : "auto",
          }}
        >
          <React.Suspense
            fallback={
              <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <CircularProgress size={20} />
              </Box>
            }
          >
            {props.txnType === txn_summary.Balance && (
              <BalanceByAccountTypeBreakdown
                networth={{
                  expense: props.networth?.expenseSum || 0,
                  income: props.networth?.incomeSum || 0,
                  savings: props.networth?.contributionSum || 0,
                  debts : props.networth?.debtSum || 0
                }}
              />
            )}
            {props.txnType === txn_summary.Expenses && (
              <TopExpensesContainer
                filterOption={props.filterOption}
                startDate={props.startDate}
                endDate={props.endDate}
                selectedCategories={props.selectedCategories}
              />
            )}
            {props.txnType === txn_summary.Budget && (
              <TopBudgetsContainer
                filterOption={props.filterOption}
                startDate={props.startDate}
                endDate={props.endDate}
                selectedCategories={props.selectedCategories}
              />
            )}
            {props.txnType === txn_summary.Income && (
              <TopIncomeContainer
                filterOption={props.filterOption}
                startDate={props.startDate}
                endDate={props.endDate}
              />
            )}
            {props.txnType === txn_summary.Savings && (
              <TopSavingsContributionsContainer
                filterOption={props.filterOption}
                startDate={props.startDate}
                endDate={props.endDate}
              />
            )}
            {props.txnType === txn_summary.Debt && (
              <DebtBreakdownByType 
                timeframe={props.filterOption}
                dateStart={props.startDate || undefined}
                dateEnd={props.endDate || undefined}
              />
            )}
          </React.Suspense>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default React.memo(TransactionOverviewDialog);
