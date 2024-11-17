import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { Avatar, IconButton, Skeleton, Stack } from "@mui/material";
import Typography from "@mui/material/Typography";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { txn_summary } from "../../constants/collections";
import { PERCENTAGE_DECREASE } from "../../constants/componentTheme";
import { AVATAR_SIZE_SM, iconSizeXS } from "../../constants/size";
import { FilterTimeframe } from "../../constants/timeframes";
import { formatNumberWithoutCurrency } from "../../helper/utils";
import { RootState } from "../../redux/store";
import TransactionOverviewDialog from "./TransactionOverviewDialog";
import { calculateCurrentSum, calculatePercentageIncrease, calculatePrevSum, determinePercentageColor, determinePercentageIcon, determinePercentageStr } from "./TransactionOverviewHelper";

type TransactionSummaryType = {
  currentSUM: number | null; 
  prevSUM: number | null;
  percentage: string | null;
  percentageIcon: React.JSX.Element | null
  percentagecolor : string | null
} 
type TransactionDataType = {
  isDarkMode: boolean;
  color: string;
  icon: React.JSX.Element;
  type: txn_summary;
  prevDate: string;
  filterOption: FilterTimeframe;
  filterTitle: string;
  startDate: Date | null;
  endDate: Date | null;
};
type SumAmountType = {
  expenseSum: number; incomeSum: number; contributionSum: number; budgetSum: number
  expensePrevSum: number; incomePrevSum: number; contributionPrevSum: number; budgetPrevSum: number
}
interface Props {
  data: TransactionDataType;
  sumAmounts : SumAmountType; 
  networth: { expenseSum?: number; incomeSum?: number; contributionSum?: number };
  openInfoDialog: () => void;
}

const TransactionOverviewItems = (props: Props) => {
  const isMasked = useSelector((state: RootState) => state.userAccount.hideBalances);

  const [transactionSummary, setTransactionSummary] = React.useState<TransactionSummaryType>({
    currentSUM: null,
    prevSUM : null,
    percentage: null,
    percentageIcon : null,
    percentagecolor : null
  });

  useEffect(() => {
    if (props.data.prevDate) {
      const currentSUM = calculateCurrentSum(props.data.type, props.sumAmounts.incomeSum, props.sumAmounts.expenseSum, props.sumAmounts.contributionSum, props.sumAmounts.budgetSum);
      const prevSUM = calculatePrevSum(props.data.type, props.sumAmounts.incomePrevSum, props.sumAmounts.expensePrevSum, props.sumAmounts.contributionPrevSum, props.sumAmounts.budgetPrevSum);
      const percentageIncrease = calculatePercentageIncrease(currentSUM, prevSUM);
      const percentagecolor = determinePercentageColor(percentageIncrease);
      const percentageSTR = determinePercentageStr(percentageIncrease, currentSUM, prevSUM);
      const percentageIcon = determinePercentageIcon(percentageIncrease, currentSUM, prevSUM);
  
      setTransactionSummary({
        currentSUM,
        prevSUM,
        percentage: percentageSTR,
        percentageIcon,
        percentagecolor
      });
    }
  }, [props]);

  const [expandedStates, setExpandedStates] = React.useState<Record<string, boolean>>({});
  const handleExpandClick = (accountType: string) => {
    setExpandedStates((prevState) => ({
      ...prevState,
      [accountType]: !prevState[accountType],
    }));
  };

  return (
    <div>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Stack direction="row" alignItems="center">
          {/* Avatar/ICON --------------------------------------------------------------------------- */}

          <Stack direction="row" alignItems="center">
            <Avatar sx={{ bgcolor: props.data.color }} style={AVATAR_SIZE_SM}>
              {props.data.icon}
            </Avatar>
            <Typography variant="body1" ml={0.5}>
              {props.data.type}
            </Typography>
            {props.data.type === txn_summary.Balance && (
              <InfoOutlinedIcon
                onClick={props.openInfoDialog}
                sx={{
                  ml: 0.5,
                  fontSize: iconSizeXS,
                  cursor: "pointer",
                  WebkitTapHighlightColor: "transparent",
                  color: props.data.isDarkMode ? "#ccc" : "#666",
                }}
              />
            )}
          </Stack>
        </Stack>

        <Stack direction="row" alignItems="center">
          {/* PERCENTAGE ICON  ----------------------------------------------------------------------*/}

          <Stack direction="column">
            { transactionSummary.currentSUM  !== null ? (
                <Typography
                textAlign="left"
                variant="h4"
                sx={{
                  color: transactionSummary.currentSUM < 0 ? PERCENTAGE_DECREASE : "inherit",
                }}
              >
                {/* AMOUNT  ---------------------------------------------------------------------------*/}
                {isMasked 
                  ? "****"
                  : formatNumberWithoutCurrency(transactionSummary.currentSUM)}
              </Typography>
            ):(
                <Skeleton animation="wave" variant="text" width={50} />
            )}
            
           
          </Stack>
          { transactionSummary.percentageIcon}
        </Stack>
      </Stack>

      {/* PERCENTAGE INCREASE/DECREASE  ---------------------------------------------------------------*/}

      <Stack direction="row" justifyContent="space-between" alignItems="center" mt={{ xs: 1, md: 2, lg: 3 }}>
      { transactionSummary.percentage  !== null ? (
        <Typography
          variant="caption"
          sx={{
            color: props.data.filterOption === FilterTimeframe.AllTime ? "transparent" : "inherit",
            ml: 1,
          }}
        >
          {props.data.filterOption !== FilterTimeframe.AllTime && props.data.prevDate ? (
            <>
              <span style={{ color: transactionSummary.percentagecolor  || ""}}>{transactionSummary.percentage || ""}</span>
              {` from ${props.data.prevDate} `}
              {transactionSummary.prevSUM === 0 || props.data.prevDate === ""
                ? ""
                : `(${
                    isMasked && (props.data.type === txn_summary.Balance || props.data.type === txn_summary.Income)
                      ? "****"
                      : formatNumberWithoutCurrency(transactionSummary.prevSUM || 0)
                  })`}
            </>
          ) : (
            ""
          )}
        </Typography>

      ):(
        <Skeleton animation="wave" variant="text" width={100} />
      )}

        {/* Expand More Icon -----------------------------------------------------------------------*/}

        <IconButton
          onClick={() => handleExpandClick(props.data.type)}
          sx={{
            transform: expandedStates[props.data.type] ? "rotate(180deg)" : "none",
            transition: "transform 0.3s",
            mr: -1.6,
          }}
        >
          <ExpandMoreIcon />
        </IconButton>
      </Stack>

      <TransactionOverviewDialog
        filterOption={props.data.filterOption}
        filterTitle={props.data.filterTitle}
        startDate={props.data.startDate}
        endDate={props.data.endDate}
        totalAmount={transactionSummary.currentSUM || 0}
        txnType={props.data.type}
        openDialog={expandedStates[props.data.type] || false}
        onDialogClose={() => handleExpandClick(props.data.type)}
        networth={props.networth}
        isDarkMode={props.data.isDarkMode}
      />
    </div>
  );
};

export default TransactionOverviewItems;
