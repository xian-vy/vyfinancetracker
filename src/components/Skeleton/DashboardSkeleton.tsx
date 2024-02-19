import { Grid, Paper, useTheme } from "@mui/material";
import React from "react";
import AllTrendChartSkeleton from "./AllTrendChartSkeleton";
import ShortcutSkeleton from "./ShortcutSkeleton";
import SummarySkeleton from "./SummarySkeleton";

const DashboardSkeleton = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  return (
    <Grid container spacing={{ xs: 1, sm: 1.5, lg: 2 }} pb={{ xs: 10, md: 5 }} style={{ overflow: "hidden" }}>
      {/**SUMMARY ---------------------------------------------------------------------------------------*/}
      <Grid item xs={12}>
        <Paper sx={{ borderRadius: 4, px: 1, py: 1 }} variant={isDarkMode ? "elevation" : "outlined"}>
          <SummarySkeleton />
        </Paper>
      </Grid>
      {/**ACCOUNT BALANCE ---------------------------------------------------------------------------------------*/}

      <Grid item xs={12}>
        <Paper sx={{ borderRadius: 4, px: 1, py: 0.7 }} variant={isDarkMode ? "elevation" : "outlined"}>
          <SummarySkeleton isAccountBalance={true} />
        </Paper>
      </Grid>

      <Grid item xs={12}>
        <Paper sx={{ borderRadius: 4, py: 1 }} variant={isDarkMode ? "elevation" : "outlined"}>
          <ShortcutSkeleton />
        </Paper>
      </Grid>
      {/**All TREND CHART ------------------------------------------------------------------------*/}
      <Grid item xs={12}>
        <Paper sx={{ borderRadius: 4, px: 1, py: 1 }} variant={isDarkMode ? "elevation" : "outlined"}>
          <AllTrendChartSkeleton />
        </Paper>
      </Grid>
    </Grid>
  );
};

export default DashboardSkeleton;
