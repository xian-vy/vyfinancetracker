import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LeaderboardOutlinedIcon from "@mui/icons-material/LeaderboardOutlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import { Container, IconButton, Stack, Tooltip, Typography, useTheme } from "@mui/material";
import React, { useState } from "react";
import { ThemeColor, formatShortAmountWithCurrency } from "../../helper/utils";
import { FilterTimeframe } from "../../constants/timeframes";
import { iconSize, iconSizeXS } from "../../constants/size";
import { txn_types } from "../../constants/collections";
import { useCategoryList } from "../../hooks/categoryListHook";
import TransactionOverviewDialog from "../Dashboard/TransactionOverviewDialog";
import CustomIconButton from "../CustomIconButton";
import TimeframeDrawerPopOver from "./TimeframeDrawerPopOver";

interface Props {
  onFilterChange: (filterOption: string) => void;
  onCategoryChange: (categories: string[]) => void;
  title: string;
  timeframe: string;
  selectedCategory: string[];
  filterOption: FilterTimeframe;
  startDate: Date | null;
  endDate: Date | null;
  txnType: string;
  totalAmount: number;
}
const FilterBudgetExpenseTrend = (props: Props) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const [filterOpen, setFilterOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [breakdownOpen, setBreakdownOpen] = useState(false);

  const { renderCategoryList, selectedCategory, handleCategoryClick } = useCategoryList();

  React.useEffect(() => {
    if (selectedCategory) {
      props.onCategoryChange(selectedCategory);
    }
  }, [selectedCategory]);

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
  if (props.txnType === txn_types.Budget) {
    icon = <AccountBalanceWalletOutlinedIcon sx={{ fontSize: iconSizeXS }} />;
  } else {
    icon = <ShoppingBagOutlinedIcon sx={{ fontSize: iconSizeXS }} />;
  }
  return (
    <Container maxWidth={false} sx={{ p: 1 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ sm: "center" }}
        justifyContent="space-between"
        style={{
          width: "100%",
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" flexGrow={1}>
          <Stack direction="row" alignItems="center">
            {icon}
            <Typography ml={0.5} variant="h6">
              {props.title}
              <span
                style={{
                  marginLeft: "5px",
                }}
              >
                {formatShortAmountWithCurrency(Math.round(props.totalAmount), false, true)}
              </span>
            </Typography>
          </Stack>

          <IconButton onClick={() => setBreakdownOpen(true)}>
            <Tooltip title="Category breakdown">
              <LeaderboardOutlinedIcon sx={{ fontSize: iconSizeXS }} />
            </Tooltip>
          </IconButton>
        </Stack>

        <Stack
          direction="row"
          alignItems="center"
          sx={{ justifyContent: { xs: "space-between", sm: "flex-end" } }}
          ml={{ xs: -1, sm: 0 }}
        >
          <CustomIconButton type="filter" onClick={handleCategoryClick}>
            <Tooltip title={selectedCategory}>
              <Typography variant="caption" style={{ color: ThemeColor(theme) }}>
                {selectedCategory.length > 1 ? `${selectedCategory[0]}...` : selectedCategory[0]}
              </Typography>
            </Tooltip>
            <ExpandMoreIcon fontSize="small" />
          </CustomIconButton>

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

      {renderCategoryList()}
      <TransactionOverviewDialog
        filterOption={props.filterOption}
        filterTitle={props.timeframe}
        startDate={props.startDate}
        endDate={props.endDate}
        totalAmount={props.totalAmount}
        txnType={props.txnType}
        openDialog={breakdownOpen}
        onDialogClose={() => setBreakdownOpen(false)}
        selectedCategories={selectedCategory}
        isDarkMode={isDarkMode}
      />
    </Container>
  );
};

export default React.memo(FilterBudgetExpenseTrend);
