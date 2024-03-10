import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LeaderboardOutlinedIcon from "@mui/icons-material/LeaderboardOutlined";
import PaidOutlinedIcon from "@mui/icons-material/PaidOutlined";
import SavingsOutlinedIcon from "@mui/icons-material/SavingsOutlined";
import { Container, IconButton, Stack, Tooltip, Typography, useTheme } from "@mui/material";
import React, { useState } from "react";
import { ThemeColor, formatShortAmountWithCurrency } from "../../helper/utils";
import { FilterTimeframe } from "../../constants/timeframes";
import { iconSize, iconSizeXS } from "../../constants/size";
import { txn_types } from "../../constants/collections";
import TransactionOverviewDialog from "../Dashboard/TransactionOverviewDialog";
import CustomIconButton from "../CustomIconButton";
import TimeframeDrawerPopOver from "./TimeframeDrawerPopOver";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";

interface Props {
  onFilterChange: (filterOption: string) => void;
  title: string;
  timeframe: string;
  filterOption: FilterTimeframe;
  startDate: Date | null;
  endDate: Date | null;
  txnType: string;
  totalAmount: number;
}
const FilterBudgetExpenseTrend = (props: Props) => {
  const isMasked = useSelector((state: RootState) => state.userAccount.hideBalances);

  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const [filterOpen, setFilterOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [breakdownOpen, setBreakdownOpen] = useState(false);

  const handleFilterClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    setAnchorEl(event.currentTarget);
    setFilterOpen(!filterOpen);
  };

  const handleFilterClose = () => {
    setAnchorEl(null);
    setFilterOpen(false);
  };

  const handleFilterOptionChange = (option: FilterTimeframe) => {
    props.onFilterChange(option);
    handleFilterClose();
  };

  let icon: React.ReactElement;
  if (props.txnType === txn_types.Income) {
    icon = <PaidOutlinedIcon sx={{ fontSize: iconSizeXS }} />;
  } else {
    icon = <SavingsOutlinedIcon sx={{ fontSize: iconSizeXS }} />;
  }
  return (
    <Container maxWidth={false} sx={{ p: 1 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Stack direction="row" alignItems="center">
          {icon}
          <Typography ml={0.5} variant="h6">
            {props.title}
            <span
              style={{
                marginLeft: "5px",
              }}
            >
              {isMasked && props.txnType === txn_types.Income
                ? "****"
                : formatShortAmountWithCurrency(props.totalAmount, false, true)}
            </span>
          </Typography>
        </Stack>

        <Stack direction="row" alignItems="center">
          <IconButton onClick={() => setBreakdownOpen(true)}>
            <Tooltip title="Category breakdown">
              <LeaderboardOutlinedIcon sx={{ fontSize: iconSizeXS }} />
            </Tooltip>
          </IconButton>

          <CustomIconButton onClick={handleFilterClick} type="filter">
            <Typography variant="caption" style={{ color: ThemeColor(theme) }}>
              {props.timeframe}
            </Typography>
            <ExpandMoreIcon fontSize={iconSize} />
          </CustomIconButton>
        </Stack>
      </Stack>

      <TimeframeDrawerPopOver
        filterOpen={filterOpen}
        anchorEl={anchorEl}
        handleFilterClose={handleFilterClose}
        handleFilterOptionChange={handleFilterOptionChange}
        selectedTimeframe={props.filterOption}
      />

      <TransactionOverviewDialog
        filterOption={props.filterOption}
        filterTitle={props.timeframe}
        startDate={props.startDate}
        endDate={props.endDate}
        totalAmount={props.totalAmount}
        txnType={props.txnType}
        openDialog={breakdownOpen}
        onDialogClose={() => setBreakdownOpen(false)}
        isDarkMode={isDarkMode}
      />
    </Container>
  );
};

export default React.memo(FilterBudgetExpenseTrend);
