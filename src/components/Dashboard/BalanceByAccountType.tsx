import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Box,
  CircularProgress,
  Container,
  IconButton,
  Paper,
  Stack,
  Typography,
  useTheme
} from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";
import { PERCENTAGE_DECREASE } from "../../constants/componentTheme";
import { COMPONENTS_WITH_TIMEFRAME } from "../../constants/constants";
import { useAccountTypeContext } from "../../contextAPI/AccountTypeContext";
import { filterDataByDateRange } from "../../helper/GenericTransactionHelper";
import { formatNumberWithoutCurrency, getFilterTitle } from "../../helper/utils";
import { generateAccountsBalancesWorker } from "../../helper/workers/workerHelper";
import { useFilterHandlers } from "../../hooks/filterHook";
import AccountsIcons from "../../media/AccountsIcons";
import { RootState } from "../../redux/store";
import FilterActionsComponent from "../Filter/FilterActionsComponent";
import BalanceByAccountTypeDialog from "./BalanceByAccountTypeDialog";
import BalanceByAccountTypeHeader from "./BalanceByAccountTypeHeader";
import SwapAccount from "./SwapAccount";

interface AccountDetails {
  balance: number;
  income: number;
  expense: number;
  savings: number;
  color: string;
  icon: string;
}
const swiperSlideStyle = { display: "inline-block", width: "auto" };
const paperStyle = {
  px: { xs: 1.5, sm: 2 },
  py: { xs: 1, md: 1.5 },
  borderRadius: 2,
  mb: 1,
};

const typographyStyle = {
  whiteSpace: "nowrap",
  ml: { xs: 0, sm: 0.5, md: 1, lg: 2, xl: 3 },
  color: "#333"
};

const BalanceByAccountType = () => {
  const isMasked = useSelector((state: RootState) => state.userAccount.hideBalances);

  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const {
    filterOption,
    customMonthOpen,
    customYearOpen,
    startDate,
    anchorEl,
    filterOpen,
    handleFilterClick,
    handleFilterClose,
    endDate,
    handleFilterOptionChange,
    handleCloseForm,
    handleYearFilter,
    handleMonthFilter,
  } = useFilterHandlers(COMPONENTS_WITH_TIMEFRAME.DASHBOARD_ACCOUNT_BALANCES);

  function renderIcon(icon: React.ReactElement, color: string) {
    return React.cloneElement(icon, { style: { color: color, fontSize: "18px" } });
  }

  const [expandedStates, setExpandedStates] = React.useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [openSwapAccount, setOpenSwapAccount] = useState(false);

  const handleExpandClick = (accountType: string) => {
    setExpandedStates((prevState) => ({
      ...prevState,
      [accountType]: !prevState[accountType],
    }));
  };

  const incomeStore = useSelector((state: RootState) => state.income.income);
  const expenseStore = useSelector((state: RootState) => state.expenses.expenses);
  const savingsContributionStore = useSelector((state: RootState) => state.savingsContribution.contribution);

  const { accountType } = useAccountTypeContext();

  const incomeData = useMemo(
    () => filterDataByDateRange(incomeStore, "date", filterOption, startDate || undefined, endDate || undefined),
    [incomeStore, filterOption, startDate, endDate]
  );

  const expenseData = useMemo(
    () => filterDataByDateRange(expenseStore, "date", filterOption, startDate || undefined, endDate || undefined),
    [expenseStore, filterOption, startDate, endDate]
  );

  const contributionData = useMemo(
    () =>
      filterDataByDateRange(
        savingsContributionStore,
        "date",
        filterOption,
        startDate || undefined,
        endDate || undefined
      ),
    [savingsContributionStore, filterOption, startDate, endDate]
  );

  const [data, setData] = useState<AccountDetails[] | undefined>(undefined);

  const worker = useMemo(
    () => new Worker(new URL("../../helper/workers/workers", import.meta.url)),
    [incomeData, expenseData, contributionData, accountType]
  );

  // necessary to populate/do worker function on first load
  useEffect(() => {
    return () => {
      worker.terminate();
    };
  }, [worker]);

  useEffect(() => {
    let isMounted = true;

    generateAccountsBalancesWorker(worker, incomeData, expenseData, contributionData, accountType).then((data) => {
      if (isMounted) {
        setData(data as AccountDetails[]);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [incomeData, expenseData, contributionData, accountType]);

  useEffect(() => {
    if (data) {
      setLoading(true);

      setTimeout(() => {
        setLoading(false);
      }, 500);
    }
  }, [filterOption]);

  const iconMap = useMemo(() => new Map(AccountsIcons.map((icon) => [icon.name, icon.icon])), [AccountsIcons]);
  const filterTitle = getFilterTitle(filterOption, startDate, endDate);

  const sortedData = useMemo(() => {
    if (!data) return [];
    return Object.entries(data).sort((a, b) => {
      const balanceA = a[1].balance;
      const balanceB = b[1].balance;

      return balanceA < 0 && balanceB < 0
        ? balanceA - balanceB
        : balanceA < 0
        ? 1
        : balanceB < 0
        ? -1
        : balanceB - balanceA;
    });
  }, [data]);

  const handleSwapOpen = () => {
    setOpenSwapAccount(true);
  };

  return (
    <>
      <Container maxWidth={false} sx={{ p: 1 }}>
        <BalanceByAccountTypeHeader
          onfilterClick={handleFilterClick}
          onSwapClick={handleSwapOpen}
          timeframe={filterTitle}
        />
      </Container>
      <Box sx={{ minHeight: { xs: 90, md: 96 }, pt: 1, px: { xs: 0, md: 3 } }}>
        {!data || loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" mb={1}>
            <CircularProgress size={20} />
          </Box>
        ) : (
          <Swiper
            spaceBetween={10}
            slidesPerView="auto"
            centeredSlides={false}
            breakpoints={{
              640: {
                spaceBetween: 15,
              },
              1024: {
                spaceBetween: 15,
              },
            }}
          >
            {sortedData.map(([accountType, accountDetails]: [string, AccountDetails]) => {
              const categoryIcon = iconMap.get(accountDetails.icon);
              return (
                <SwiperSlide key={accountType} style={swiperSlideStyle}>
                  <Paper sx={paperStyle} variant={isDarkMode ? "elevation" : "outlined"}>
                    <Stack direction="column">
                      <Stack direction="row" justifyContent="space-between">
                        <Stack direction="row" mr={{ xs: 2, md: 3, lg: 4 }}>
                          {categoryIcon &&
                            renderIcon(
                              categoryIcon,
                              isDarkMode ? accountDetails.color || "#ccc" : accountDetails.color || ""
                            )}
                          <Typography variant="body1" ml={0.5} sx={{ whiteSpace: "nowrap" }}>
                            {accountType}
                          </Typography>
                        </Stack>
                        <Typography
                          variant="body2"
                          style={{ color: accountDetails.balance < 0 ? PERCENTAGE_DECREASE : "inherit" }}
                          sx={typographyStyle}
                        >
                          {isMasked ? "****" : formatNumberWithoutCurrency(accountDetails.balance)}
                        </Typography>
                      </Stack>

                      <Stack direction="row" alignItems="flex-end" justifyContent="flex-end">
                        {/* Expand More Icon -----------------------------------------------------------------------*/}

                        <IconButton
                          onClick={() => handleExpandClick(accountType)}
                          sx={{
                            transform: expandedStates[accountType] ? "rotate(180deg)" : "none",
                            transition: "transform 0.3s",
                            mr: -1.5,
                          }}
                        >
                          <ExpandMoreIcon />
                        </IconButton>
                      </Stack>

                      <BalanceByAccountTypeDialog
                        networth={{
                          income: accountDetails.income,
                          expense: accountDetails.expense,
                          savings: accountDetails.savings,
                        }}
                        openDialog={expandedStates[accountType] || false}
                        onDialogClose={() => handleExpandClick(accountType)}
                        accountType={accountType}
                        totalAmount={accountDetails.balance}
                        filterTitle={filterTitle}
                      />
                    </Stack>
                  </Paper>
                </SwiperSlide>
              );
            })}
          </Swiper>
        )}
      </Box>

      <FilterActionsComponent
        filterOpen={filterOpen}
        anchorEl={anchorEl}
        handleFilterClose={handleFilterClose}
        customMonthOpen={customMonthOpen}
        customYearOpen={customYearOpen}
        handleFilterOptionChange={handleFilterOptionChange}
        handleCloseForm={handleCloseForm}
        handleMonthFilter={handleMonthFilter}
        handleYearFilter={handleYearFilter}
        selectedTimeframe={filterOption}
      />

      <SwapAccount openDialog={openSwapAccount} onDialogClose={() => setOpenSwapAccount(false)} />
    </>
  );
};

export default React.memo(BalanceByAccountType);
