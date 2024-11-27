import { CircularProgress, Grid, Paper, Stack, useTheme } from "@mui/material";
import React from "react";
import AllTransactionsTrendChartContainer from "./AllTransactionsTrendChartContainer";
import BalanceByAccountType from "./BalanceByAccountType";
import Shortcuts from "./Shortcuts";
import TransactionOverview from "./TransactionOverview";
import { useSliceFetchingStates } from "../../hooks/slicefetchingHook";

const Dashboard = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const { isLoading } = useSliceFetchingStates();

  if (isLoading) {
    return (
      <Stack justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress size={15} />
      </Stack>
    )
  }
  return (
    <>
      <Grid container spacing={{ xs: 1, sm: 1.5, lg: 2 }} pb={{ xs: 10, md: 5 }} style={{ overflow: "hidden" }}>
        {/** TXN OVERVIEW -------------------------------------------------------------------------------------*/}
        <Grid item xs={12} sm={12} md={12} lg={12} style={{ overflow: "hidden" }}>
          <Paper sx={{ borderRadius: 2, px: 1, py: 1 }} variant={isDarkMode ? "elevation" : "outlined"}>
            <TransactionOverview />
          </Paper>
        </Grid>
        <Grid item xs={12} lg={12}>
          <Paper sx={{ borderRadius: 2, px: 1, py: 1 }} variant={isDarkMode ? "elevation" : "outlined"}>
            <BalanceByAccountType />
          </Paper>
        </Grid>

        {/**SHORTCUTS ---------------------------------------------------------------------------------------*/}
        <Grid item xs={12} lg={12}>
          <Paper
            sx={{ borderRadius: 2, px: 2, py: 1, minHeight: { xs: 90, md: 120 } }}
            variant={isDarkMode ? "elevation" : "outlined"}
          >
            <Shortcuts />
          </Paper>
        </Grid>

        {/**ALL TXN TREND CHART -----------------------------------------------------------------------------*/}
        <Grid item xs={12} lg={12}>
          <Paper sx={{ borderRadius: 2, px: 1, pt: 1, pb: 1.5 }} variant={isDarkMode ? "elevation" : "outlined"}>
            <AllTransactionsTrendChartContainer />
          </Paper>
        </Grid>
      </Grid>
    </>
  );
};

export default Dashboard;
