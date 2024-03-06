import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import React from "react";
import { useSelector } from "react-redux";
import { formatShortAmountWithCurrency } from "../../helper/utils";
import { DASHBOARD_DIALOG } from "../../constants/size";
import { txn_summary } from "../../constants/collections";
import { PERCENTAGE_DECREASE } from "../../constants/componentTheme";
import { FilterTimeframe } from "../../constants/timeframes";
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
  networth?: { expenseSum?: number; incomeSum?: number; contributionSum?: number };
  selectedCategories?: string[];
  isDarkMode: boolean;
}

const TransactionOverviewBalanceBreakdown = React.lazy(() => import("./TransactionOverviewBalanceBreakdown"));
const TopBudgetsContainer = React.lazy(() => import("../Charts/Budget/TopBudgetsContainer"));
const TopExpensesContainer = React.lazy(() => import("../Charts/Expenses/TopExpensesContainer"));
const TopIncomeContainer = React.lazy(() => import("../Charts/Income/TopIncomeContainer"));
const TopSavingsContributionsContainer = React.lazy(() => import("../Charts/Savings/TopSavingsContributionsContainer"));

const TransactionOverviewDialog = (props: Props) => {
  const powerSavingMode = useSelector((state: RootState) => state.powerSaving.enabled);

  return (
    <>
      <Dialog
        open={props.openDialog}
        onClose={() => props.onDialogClose()}
        PaperProps={{
          sx: { borderRadius: 3 },
        }}
        fullWidth
        maxWidth="xs"
        transitionDuration={powerSavingMode ? 0 : undefined}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            backgroundColor: props.isDarkMode ? "#1e1e1e" : "#fff",
            alignItems: "center",
            pb: 2,
          }}
        >
          <Stack direction="row" alignItems="center">
            <Typography variant="body2">
              {props.txnType} {props.filterTitle}
            </Typography>
          </Stack>

          <Typography variant="body2" sx={{ color: props.totalAmount < 0 ? PERCENTAGE_DECREASE : "inherit" }}>
            {formatShortAmountWithCurrency(Math.round(props.totalAmount), false, true)}
          </Typography>
        </DialogTitle>

        <DialogContent
          sx={{
            px: 3,
            py: 0,
            backgroundColor: props.isDarkMode ? "#1e1e1e" : "#fff",
            minHeight: props.txnType === txn_summary.Balance ? 100 : DASHBOARD_DIALOG + 60, //allowance for breadcrumbs
            maxHeight: props.txnType === txn_summary.Balance ? 250 : { xs: 250, md: 350, lg: 500 },
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
              <TransactionOverviewBalanceBreakdown
                networth={{
                  expenseSum: props.networth?.expenseSum || 0,
                  incomeSum: props.networth?.incomeSum || 0,
                  contributionSum: props.networth?.contributionSum || 0,
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
          </React.Suspense>
        </DialogContent>
        <DialogActions
          sx={{
            backgroundColor: props.isDarkMode ? "#1e1e1e" : "#fff",
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

export default React.memo(TransactionOverviewDialog);
