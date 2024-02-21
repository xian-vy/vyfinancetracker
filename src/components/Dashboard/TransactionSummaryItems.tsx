import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { Avatar, Box, CircularProgress, IconButton, Stack } from "@mui/material";
import Typography from "@mui/material/Typography";
import React from "react";
import { formatNumberWithoutCurrency } from "../../helper/utils";
import { AVATAR_SIZE_SM, iconSizeXS } from "../../constants/size";
import { txn_summary } from "../../constants/collections";
import { PERCENTAGE_DECREASE } from "../../constants/componentTheme";
import { FilterTimeframe } from "../../constants/timeframes";
import CategoryBreakdownDialog from "../Charts/CategoryBreakdownDialog";

type sumByTransaction = {
  sum: number;
  prevSum: number;
  prevDate: string;
};
interface Props {
  color: string;
  icon: React.JSX.Element;
  type: txn_summary;
  isDarkMode: boolean;
  dataLoadStatus: Record<txn_summary, sumByTransaction | null>;
  percentageIcon: React.JSX.Element;
  currentSUM: number;
  prevSUM: number;
  percentagecolor: string;
  filterOption: FilterTimeframe;
  prevDate: string;
  percentageSTR: string;
  filterTitle: string;
  networth: { expenseSum?: number; incomeSum?: number; contributionSum?: number };
  startDate: Date | null;
  endDate: Date | null;
  openInfoDialog: () => void;
  loading: boolean;
}

const TransactionSummaryItems = (props: Props) => {
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
            <Avatar sx={{ bgcolor: props.color }} style={AVATAR_SIZE_SM}>
              {props.icon}
            </Avatar>
            <Typography variant="body1" ml={0.5}>
              {props.type}
            </Typography>
            {props.type === txn_summary.Balance && (
              <InfoOutlinedIcon
                onClick={props.openInfoDialog}
                sx={{
                  ml: 0.5,
                  fontSize: iconSizeXS,
                  cursor: "pointer",
                  WebkitTapHighlightColor: "transparent",
                  color: props.isDarkMode ? "#ccc" : "#666",
                }}
              />
            )}
          </Stack>
        </Stack>

        <Stack direction="row" alignItems="center">
          {/* PERCENTAGE ICON  ----------------------------------------------------------------------*/}

          {(!props.dataLoadStatus[props.type] || !props.loading) && props.percentageIcon}
          <Stack direction="column">
            {/* Show loading if budget not ready since its calculated using web worker ----------*/}
            {!props.dataLoadStatus[props.type] || props.loading ? (
              <Box display="flex" justifyContent="center" alignItems="center">
                <CircularProgress size={20} />
              </Box>
            ) : (
              <Typography
                textAlign="left"
                variant="h4"
                sx={{ color: props.currentSUM < 0 ? PERCENTAGE_DECREASE : "inherit" }}
              >
                {/* AMOUNT  ---------------------------------------------------------------------------*/}

                {formatNumberWithoutCurrency(props.currentSUM)}
              </Typography>
            )}
          </Stack>
        </Stack>
      </Stack>

      {/* PERCENTAGE INCREASE/DECREASE  ---------------------------------------------------------------*/}

      <Stack direction="row" justifyContent="space-between" alignItems="center" mt={{ xs: 1, md: 2, lg: 3 }}>
        <Typography
          variant="caption"
          sx={{
            color: props.filterOption === FilterTimeframe.AllTime ? "transparent" : "inherit",
            ml: 1,
          }}
        >
          {props.filterOption !== FilterTimeframe.AllTime && props.prevDate ? (
            <>
              <span style={{ color: props.percentagecolor }}>{props.percentageSTR}</span>
              {` from ${props.prevDate} `}
              {props.prevSUM === 0 || props.prevDate === "" ? "" : `(${formatNumberWithoutCurrency(props.prevSUM)})`}
            </>
          ) : (
            ""
          )}
        </Typography>
        {/* Expand More Icon -----------------------------------------------------------------------*/}

        <IconButton
          onClick={() => handleExpandClick(props.type)}
          sx={{
            transform: expandedStates[props.type] ? "rotate(180deg)" : "none",
            transition: "transform 0.3s",
            mr: -1.6,
          }}
        >
          <ExpandMoreIcon />
        </IconButton>
      </Stack>

      <CategoryBreakdownDialog
        filterOption={props.filterOption}
        filterTitle={props.filterTitle}
        startDate={props.startDate}
        endDate={props.endDate}
        totalAmount={props.currentSUM}
        txnType={props.type}
        openDialog={expandedStates[props.type] || false}
        onDialogClose={() => handleExpandClick(props.type)}
        networth={props.networth}
        isDarkMode={props.isDarkMode}
      />
    </div>
  );
};

export default TransactionSummaryItems;
